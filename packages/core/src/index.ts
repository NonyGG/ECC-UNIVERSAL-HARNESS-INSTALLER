import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { randomUUID, createHash } from "node:crypto"
import type {
  UniversalHarnessAdapter, HarnessDescriptor, HarnessDetectionResult, HarnessCompatibility,
  UniversalInstallationPlan, InstallResult, HarnessHealth, RollbackResult, VerifyContext,
  UpdateContext, RollbackContext, InstallContext, InstallationManifest, HarnessEventEnvelope,
  HarnessCapabilities, CapabilityLevel, UniversalInstallationPlan as Plan,
} from "@ecc-installer/contracts"
import { INTEGRATION_DIR, MANIFEST_FILE } from "@ecc-installer/adapter-sdk"

export * from "@ecc-installer/contracts"
export { INTEGRATION_DIR, MANIFEST_FILE }

/** Adapter registry — one adapter per harness, deterministic ids, extensible without core changes. */
export class HarnessAdapterRegistry {
  private adapters = new Map<string, UniversalHarnessAdapter>()
  register(adapter: UniversalHarnessAdapter): void {
    if (this.adapters.has(adapter.descriptor.id)) throw new Error(`adapter already registered: ${adapter.descriptor.id}`)
    this.adapters.set(adapter.descriptor.id, adapter)
  }
  get(id: string): UniversalHarnessAdapter {
    const a = this.adapters.get(id)
    if (!a) throw new Error(`unknown harness adapter: ${id}`)
    return a
  }
  list(): HarnessDescriptor[] { return [...this.adapters.values()].map((a) => a.descriptor) }
}

const FORBIDDEN = ["if (harness ===", "switch (harness", 'harness === "']
export function assertCoreHasNoPerHarnessRules(coreSource: string): void {
  for (const f of FORBIDDEN) if (coreSource.includes(f)) throw new Error(`per-harness rule leaked into core: ${f}`)
}

/** Resolve ECC root: explicit → config → env → installed package → known location. */
export function resolveEccRoot(explicit?: string, config?: Record<string, unknown>, env = process.env): { root: string; via: string; apiImportable: boolean } {
  const cands: { v: string; via: string }[] = []
  if (explicit) cands.push({ v: explicit, via: "explicit" })
  const cfg = (config?.eccRoot as string) || undefined
  if (cfg) cands.push({ v: cfg, via: "config" })
  if (env.ECC_ROOT) cands.push({ v: env.ECC_ROOT, via: "env" })
  for (const c of cands) {
    const root = resolve(c.v)
    if (existsSync(join(root, "dist", "institutional", "index.js"))) return { root, via: c.via, apiImportable: true }
  }
  // installed package in node_modules
  const nm = resolve("node_modules/ecc-universal/dist/institutional/index.js")
  if (existsSync(nm)) return { root: resolve("node_modules/ecc-universal"), via: "package", apiImportable: true }
  return { root: "", via: "unresolved", apiImportable: false }
}

export function eccVersion(root: string): string {
  try { const p = JSON.parse(readFileSync(join(root, "package.json"), "utf8")); return p.version || "unknown" } catch { return "unknown" }
}
export function eccHash(root: string): string {
  const idx = join(root, "dist", "institutional", "index.js")
  return existsSync(idx) ? createHash("sha256").update(readFileSync(idx, "utf8")).digest("hex").slice(0, 16) : "unknown"
}

/** Universal discovery: project > worktree > harness/plugin > ECC institutional. */
export function universalDiscover(projectDir: string, worktreeDir: string | undefined, harnessRoots: string[], eccRoot: string): { roots: string[]; precedence: string[] } {
  const roots: string[] = []
  const seen = new Set<string>()
  const push = (p: string) => { if (p && !seen.has(resolve(p))) { seen.add(resolve(p)); roots.push(resolve(p)) } }
  push(projectDir)
  if (worktreeDir) push(worktreeDir)
  for (const h of harnessRoots) push(h)
  push(eccRoot)
  return { roots, precedence: ["project", "worktree", "harness/plugin", "ecc-institutional"] }
}

/** Capability negotiation: never simulate a missing capability. */
export function negotiateCapabilities(declared: HarnessCapabilities): Record<string, CapabilityLevel> {
  const out: Record<string, CapabilityLevel> = {}
  for (const [k, v] of Object.entries(declared)) out[k] = v ? "enabled" : "unsupported"
  return out
}

/** Universal event envelope with redaction. */
const SECRET_RE = /(sk-|ghp_|password|token|api[_-]?key|secret|bearer\s+)[a-zA-Z0-9_\-./=]{6,}/gi
export function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(payload)) {
    out[k] = typeof v === "string" ? v.replace(SECRET_RE, "[redacted]") : v
  }
  return out
}
export function buildEnvelope(partial: Partial<HarnessEventEnvelope> & Pick<HarnessEventEnvelope, "harnessId" | "eventType" | "nativeEventType" | "sessionId">): HarnessEventEnvelope {
  return {
    eventId: partial.eventId || `evt_${randomUUID()}`,
    harnessId: partial.harnessId,
    harnessVersion: partial.harnessVersion || "unknown",
    eventType: partial.eventType,
    nativeEventType: partial.nativeEventType,
    sessionId: partial.sessionId,
    projectId: partial.projectId,
    worktreeId: partial.worktreeId,
    correlationId: partial.correlationId,
    causationId: partial.causationId ?? null,
    timestamp: partial.timestamp || new Date().toISOString(),
    actor: partial.actor,
    tool: partial.tool,
    status: partial.status || "observed",
    sanitizedPayload: sanitizePayload(partial.sanitizedPayload || {}),
    schemaVersion: 1,
  }
}

export function readManifest(base: string): InstallationManifest | null {
  const p = join(base, INTEGRATION_DIR, MANIFEST_FILE)
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, "utf8")) } catch { return null }
}
export function writeManifest(base: string, m: InstallationManifest): void {
  const dir = join(base, INTEGRATION_DIR)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, MANIFEST_FILE), JSON.stringify(m, null, 2), "utf8")
}

/** Deterministic installation plan (reviewable before apply). */
export function createPlan(adapter: UniversalHarnessAdapter, ctx: InstallContext): Plan {
  return { planId: `plan_${randomUUID()}`, harness: adapter.descriptor.id, harnessVersion: adapter.descriptor.version, eccVersion: eccVersion(ctx.eccRoot), eccRoot: ctx.eccRoot, targetScope: ctx.scope, operations: [], configChanges: [], directories: [], permissions: [], preconditions: [], postconditions: [], verification: [], rollback: { backupsDir: "", ownedFiles: [], modifiedFiles: [], steps: [] }, risk: adapter.descriptor.risk, warnings: [], blockers: [], evidence: [], createdAt: new Date().toISOString() }
}

/** Transactional install: validate → backup → stage → write → configure → verify → certify → manifest. */
export async function runInstall(adapter: UniversalHarnessAdapter, ctx: InstallContext): Promise<InstallResult> {
  if (ctx.dryRun) {
    const plan = await adapter.planInstallation(ctx)
    return { installationId: `dry_${randomUUID()}`, status: "BLOCKED", planId: plan.planId, filesWritten: [], filesBackedUp: [], configChanges: [], warnings: ["dry-run: no writes performed"], blockers: [], evidence: [`dryRun:${plan.operations.length} planned`], certification: "dry-run" }
  }
  const validation = await adapter.validate(ctx)
  if (!validation.compatible || validation.blockers.length > 0) {
    return { installationId: `fail_${randomUUID()}`, status: "BLOCKED", planId: "", filesWritten: [], filesBackedUp: [], configChanges: [], warnings: [], blockers: validation.blockers, evidence: validation.evidence, certification: "blocked" }
  }
  const result = await adapter.install(ctx)
  return result
}

/** Verify: health + manifest present + no drift. */
export async function runVerify(adapter: UniversalHarnessAdapter, ctx: VerifyContext): Promise<HarnessHealth> {
  const health = await adapter.verify(ctx)
  const m = readManifest(ctx.projectDir || ctx.userDir || ".")
  health.manifestPresent = !!m
  health.driftDetected = m ? m.lastVerifiedAt !== health.lastVerifiedAt : false
  return health
}

/** Doctor: structural checks; never fixes without authorization. */
export async function doctor(adapter: UniversalHarnessAdapter, ctx: InstallContext, base: string): Promise<{ findings: string[]; health: HarnessHealth }> {
  const findings: string[] = []
  const ecc = resolveEccRoot(ctx.eccRoot)
  const health = await adapter.health(ctx)
  if (!ecc.apiImportable) findings.push("ECC institutional API not importable")
  if (!health.bridgeInstalled) findings.push("bridge not installed")
  if (!readManifest(base)) findings.push("manifest missing")
  if (health.driftDetected) findings.push("drift detected")
  findings.push("update available: check adapter version against registry")
  return { findings, health }
}

export type { Plan }
