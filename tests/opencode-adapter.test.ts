import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { HarnessAdapterRegistry } from "@ecc-installer/core"
import { OpenCodeAdapter } from "@ecc-installer/opencode"

let passed = 0, failed = 0
const at = async (name: string, fn: () => Promise<void>) => { try { await fn(); console.log(`  ✓ ${name}`); passed++ } catch (e) { console.log(`  ✗ ${name}: ${(e as Error).message}`); failed++ } }

async function main() {
  console.log("\n=== opencode adapter contract tests ===\n")
  const registry = new HarnessAdapterRegistry()
  registry.register(new OpenCodeAdapter())
  const adapter = registry.get("opencode")
  const proj = mkdtempSync(join(tmpdir(), "oc-"))
  const ecc = mkdtempSync(join(tmpdir(), "oc-ecc-"))
  mkdirSync(join(proj, ".opencode"), { recursive: true })
  writeFileSync(join(proj, "opencode.json"), "{}")
  mkdirSync(join(ecc, "dist", "institutional"), { recursive: true })
  writeFileSync(join(ecc, "dist", "institutional", "index.js"), "export const VERSION='0.1'; export const createInstitutionalRuntime=()=>({start:async()=>{}});")
  const ctx = { harnessId: "opencode", scope: "project", eccRoot: ecc, projectDir: proj, dryRun: false, yes: true, strict: true, noNetwork: true }

  await at("descriptor is honest (SUPPORTED, not all capabilities)", async () => {
    if (adapter.descriptor.status !== "SUPPORTED") throw new Error("wrong status")
    if (adapter.descriptor.supportsAgents !== true) throw new Error("agents capability declared")
    if (adapter.descriptor.risk !== "low") throw new Error("risk not low")
  })
  await at("validate passes on fixture", async () => { const v = await adapter.validate(ctx); if (!v.compatible || v.blockers.length) throw new Error(JSON.stringify(v)) })
  await at("plan is deterministic and revisable", async () => {
    const p1 = await adapter.planInstallation(ctx); const p2 = await adapter.planInstallation(ctx)
    if (p1.operations.length !== p2.operations.length) throw new Error("nondeterministic")
    if (!p1.rollback.ownedFiles.includes(".opencode/plugins/bridge/universal-bridge.mjs")) throw new Error("bridge not in rollback")
  })
  await at("install/verify/rollback roundtrip", async () => {
    const r = await adapter.install(ctx)
    if (r.status !== "INSTALLED-WITH-WARNINGS") throw new Error(r.status)
    const h = await adapter.verify({ ...ctx, installationId: r.installationId })
    if (!h.bridgeHealthy) throw new Error("not healthy")
    const src = readFileSync(join(proj, ".opencode", "plugins", "bridge", "universal-bridge.mjs"), "utf8")
    if (/new GraphStore|class Reviewer|EventStore\s*=/.test(src)) throw new Error("domain logic leaked into bridge")
    const rb = await adapter.rollback({ installationId: r.installationId, dryRun: false, yes: true, baseDir: proj })
    if (!rb.rolledBack || existsSync(join(proj, ".opencode", "plugins", "bridge", "universal-bridge.mjs"))) throw new Error("rollback incomplete")
  })
  await at("generated bridge is thin (no domain logic)", async () => {
    await adapter.install(ctx)
    const src = readFileSync(join(proj, ".opencode", "plugins", "bridge", "universal-bridge.mjs"), "utf8")
    if (/new GraphStore|class Reviewer|EventStore\s*=/.test(src)) throw new Error("domain logic leaked into bridge")
  })

  rmSync(proj, { recursive: true, force: true })
  rmSync(ecc, { recursive: true, force: true })
  console.log(`\nPassed: ${passed}\nFailed: ${failed}`)
  process.exit(failed ? 1 : 0)
}
main()
