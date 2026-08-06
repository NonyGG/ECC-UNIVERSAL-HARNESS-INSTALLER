/**
 * ECC-UNIVERSAL-HARNESS-INSTALLER-1 — operational proof (Etapa 38).
 * fresh workspace -> detect -> dry-run -> install -> verify -> health ->
 * update simulation -> rollback -> reinstall -> uninstall -> clean state.
 */
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { HarnessAdapterRegistry, runInstall, runVerify, resolveEccRoot, readManifest } from "@ecc-installer/core"
import { OpenCodeAdapter } from "@ecc-installer/opencode"

const steps: Record<string, boolean> = {}
const step = (k: string, ok: boolean) => { steps[k] = ok; console.log(`${ok ? "PASS" : "FAIL"}  ${k}`) }

async function main() {
  const work = mkdtempSync(join(tmpdir(), "ecc-harness-proof-"))
  const proj = join(work, "project")
  const ecc = join(work, "ecc")
  mkdirSync(join(proj, ".opencode", "plugins"), { recursive: true })
  writeFileSync(join(proj, "opencode.json"), "{}")
  mkdirSync(join(ecc, "dist", "institutional"), { recursive: true })
  writeFileSync(join(ecc, "dist", "institutional", "index.js"), "export const VERSION='0.1'; export const createInstitutionalRuntime=()=>({start:async()=>{},stop:async()=>{}}); export const WORKFLOW_AUTHORITY={};")
  writeFileSync(join(ecc, "package.json"), JSON.stringify({ name: "ecc", version: "0.1.0" }))

  const registry = new HarnessAdapterRegistry()
  registry.register(new OpenCodeAdapter())
  const adapter = registry.get("opencode")

  // 1. detect
  const detect = await adapter.detect({ harnessId: "opencode", scope: "project", eccRoot: ecc, projectDir: proj, dryRun: true, yes: true, strict: false, noNetwork: true })
  step("detect harness", detect.detected)
  step("resolve ECC", resolveEccRoot(ecc).apiImportable)

  // 2. dry-run (obrigatório antes de escrita)
  const dry = await runInstall(adapter, { harnessId: "opencode", scope: "project", eccRoot: ecc, projectDir: proj, dryRun: true, yes: true, strict: false, noNetwork: true })
  step("dry-run performs no writes", dry.status === "BLOCKED" && !existsSync(join(proj, ".opencode", "plugins", "bridge", "universal-bridge.mjs")))

  // 3. install + verify + health
  const ctx = { harnessId: "opencode", scope: "project", eccRoot: ecc, projectDir: proj, dryRun: false, yes: true, strict: true, noNetwork: true }
  const inst = await runInstall(adapter, ctx)
  step("transactional install", inst.status === "INSTALLED-WITH-WARNINGS")
  const health = await runVerify(adapter, { ...ctx, installationId: inst.installationId })
  step("verify healthy", health.bridgeHealthy && health.manifestPresent)
  step("manifest complete", !!readManifest(proj))
  step("bridge thin (no domain logic)", !/new GraphStore|class Reviewer/.test(readFileSync(join(proj, ".opencode", "plugins", "bridge", "universal-bridge.mjs"), "utf8")))

  // 4. update simulation
  const upd = await adapter.update({ ...ctx, fromVersion: "0.0.9", toVersion: "0.1.0" })
  step("update simulation", upd.status === "INSTALLED-WITH-WARNINGS")

  // 5. rollback + clean state
  const rb = await adapter.rollback({ installationId: inst.installationId, dryRun: false, yes: true, baseDir: proj })
  step("rollback removes owned", rb.rolledBack && !existsSync(join(proj, ".opencode", "plugins", "bridge", "universal-bridge.mjs")))
  const rb2 = await adapter.rollback({ installationId: inst.installationId, dryRun: false, yes: true, baseDir: proj })
  step("second rollback no-op", rb2.rolledBack)

  // 6. reinstall + uninstall
  await runInstall(adapter, ctx)
  const u = await adapter.rollback({ installationId: inst.installationId, dryRun: false, yes: true, baseDir: proj })
  step("uninstall leaves clean project", u.rolledBack && !existsSync(join(proj, ".opencode", "plugins", "bridge", "universal-bridge.mjs")) && !existsSync(join(proj, ".ecc-integration")))

  const allOk = Object.values(steps).every(Boolean)
  const report = { generatedAt: new Date().toISOString(), steps, allOk, adapters: registry.list().map((d) => d.id) }
  console.log(JSON.stringify({ allOk, steps: Object.keys(steps).length, failed: Object.entries(steps).filter(([, v]) => !v).map(([k]) => k) }))
  rmSync(work, { recursive: true, force: true })
  process.exit(allOk ? 0 : 1)
}
main().catch((e) => { console.error(e); process.exit(2) })
