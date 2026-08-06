import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, dirname } from "node:path"
import { HarnessAdapterRegistry, resolveEccRoot, runInstall, runVerify, negotiateCapabilities, buildEnvelope, sanitizePayload, universalDiscover } from "@ecc-installer/core"
import { OpenCodeAdapter } from "@ecc-installer/opencode"

let passed = 0, failed = 0
const t = (name: string, fn: () => void) => { try { fn(); console.log(`  ✓ ${name}`); passed++ } catch (e) { console.log(`  ✗ ${name}: ${(e as Error).message}`); failed++ } }
const at = async (name: string, fn: () => Promise<void>) => { try { await fn(); console.log(`  ✓ ${name}`); passed++ } catch (e) { console.log(`  ✗ ${name}: ${(e as Error).message}`); failed++ } }

const registry = new HarnessAdapterRegistry()
registry.register(new OpenCodeAdapter())

function fixtureRoot(): string {
  const base = mkdtempSync(join(tmpdir(), "ecc-harness-"))
  mkdirSync(join(base, ".opencode", "plugins"), { recursive: true })
  writeFileSync(join(base, "opencode.json"), "{}", "utf8")
  return base
}
function eccFixture(): string {
  const base = mkdtempSync(join(tmpdir(), "ecc-runtime-"))
  mkdirSync(join(base, "dist", "institutional"), { recursive: true })
  writeFileSync(join(base, "dist", "institutional", "index.js"), "export const VERSION='0.1'; export const createInstitutionalRuntime=()=>({start:async()=>{},stop:async()=>{},eventBus:{},eventStore:{store:()=>{}},graphStore:{}});\nexport const WORKFLOW_AUTHORITY={};", "utf8")
  writeFileSync(join(base, "package.json"), JSON.stringify({ name: "ecc", version: "0.1.0" }), "utf8")
  return base
}

async function main() {
  console.log("\n=== ecc-universal-harness-installer core tests ===\n")
  const proj = fixtureRoot()
  const ecc = eccFixture()

  console.log("Registry:")
  t("registers opencode adapter", () => { if (registry.list().length !== 1) throw new Error("registry empty") })
  t("rejects duplicate registration", () => { try { registry.register(new OpenCodeAdapter()); throw new Error("should throw") } catch { /* expected */ } })

  console.log("\nECC resolution:")
  t("resolves explicit ecc-root", () => { const r = resolveEccRoot(ecc); if (!r.apiImportable || r.root !== ecc) throw new Error(JSON.stringify(r)) })
  t("unresolved when no ecc", () => { const r = resolveEccRoot(join(tmpdir(), "missing-ecc")); if (r.apiImportable) throw new Error("should be unresolved") })

  console.log("\nCapabilities + envelope:")
  t("negotiates capabilities honestly", () => { const c = negotiateCapabilities({ tools: true, agentSelection: false } as never); if (c.tools !== "enabled" || c.agentSelection !== "unsupported") throw new Error("wrong levels") })
  t("redacts secrets", () => { const p = sanitizePayload({ token: "sk-proj-abcdef123456" }); if (JSON.stringify(p).includes("sk-proj")) throw new Error("secret leaked") })

  console.log("\nDiscovery:")
  t("precedence project>plugin>ecc", () => { const d = universalDiscover(proj, undefined, [], ecc); if (d.roots[0] !== proj || d.roots[d.roots.length - 1] !== ecc) throw new Error("bad precedence") })

  console.log("\nOpenCode adapter (fixture):")
  const ctx = { harnessId: "opencode", scope: "project", eccRoot: ecc, projectDir: proj, dryRun: true, yes: true, strict: false, noNetwork: true }
  await at("detect finds fixture harness", async () => { const d = await registry.get("opencode").detect(ctx); if (!d.detected) throw new Error("not detected") })
  await at("dry-run install performs no writes", async () => { const r = await runInstall(registry.get("opencode"), ctx); if (r.status !== "BLOCKED" || r.warnings[0] !== "dry-run: no writes performed") throw new Error(JSON.stringify(r)) })

  const ctxReal = { ...ctx, dryRun: false }
  await at("transactional install writes bridge + manifest", async () => {
    const r = await runInstall(registry.get("opencode"), ctxReal)
    if (!existsSync(join(proj, ".opencode", "plugins", "bridge", "universal-bridge.mjs"))) throw new Error("bridge missing")
    if (!existsSync(join(proj, ".ecc-integration", "installation.json"))) throw new Error("manifest missing")
  })
  await at("verify reports healthy", async () => { const h = await runVerify(registry.get("opencode"), { ...ctxReal, installationId: "inst_verify" }); if (!h.bridgeHealthy || !h.manifestPresent) throw new Error(JSON.stringify(h)) })
  await at("rollback is idempotent and removes owned files", async () => {
    const r1 = await registry.get("opencode").rollback({ installationId: "inst_1", dryRun: false, yes: true, baseDir: proj })
    if (!r1.rolledBack) throw new Error("rollback failed")
    if (existsSync(join(proj, ".opencode", "plugins", "bridge", "universal-bridge.mjs"))) throw new Error("owned file not removed")
    const r2 = await registry.get("opencode").rollback({ installationId: "inst_1", dryRun: false, yes: true, baseDir: proj })
    if (!r2.rolledBack) throw new Error("second rollback should be no-op success")
  })

  rmSync(proj, { recursive: true, force: true })
  rmSync(ecc, { recursive: true, force: true })
  console.log(`\nPassed: ${passed}\nFailed: ${failed}`)
  process.exit(failed ? 1 : 0)
}
main()
