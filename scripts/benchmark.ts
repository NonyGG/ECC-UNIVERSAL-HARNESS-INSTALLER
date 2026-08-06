/**
 * ECC-UNIVERSAL-HARNESS-INSTALLER-2 — institutional benchmark (Etapa 11).
 * Real timings on a fixture harness. No invented numbers.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { performance } from "node:perf_hooks"
import { createInstaller, resolveEccRoot } from "@ecc-installer/core"
import { OpenCodeAdapter } from "@ecc-installer/opencode"

const bench: Record<string, { ms: number; ok: boolean }> = {}
async function measure(name: string, fn: () => Promise<unknown> | unknown) {
  const t0 = performance.now()
  try { await fn(); bench[name] = { ms: Math.round((performance.now() - t0) * 100) / 100, ok: true } }
  catch (e) { bench[name] = { ms: Math.round((performance.now() - t0) * 100) / 100, ok: false }; }
}

async function main() {
  const work = mkdtempSync(join(tmpdir(), "ecc-bench-"))
  const proj = join(work, "project")
  const ecc = join(work, "ecc")
  mkdirSync(join(proj, ".opencode", "plugins"), { recursive: true })
  writeFileSync(join(proj, "opencode.json"), "{}")
  mkdirSync(join(ecc, "dist", "institutional"), { recursive: true })
  writeFileSync(join(ecc, "dist", "institutional", "index.js"), "export const VERSION='0.1'; export const createInstitutionalRuntime=()=>({start:async()=>{},stop:async()=>{}});")
  writeFileSync(join(ecc, "package.json"), JSON.stringify({ name: "ecc", version: "0.1.0" }))

  const api = createInstaller({ eccRoot: ecc })
  api.registry.register(new OpenCodeAdapter())
  const runs = 20

  await measure(`detect (${runs}x)`, async () => { for (let i = 0; i < runs; i++) await api.detectHarness("opencode", proj) })
  await measure(`plan (${runs}x)`, async () => { for (let i = 0; i < runs; i++) await api.plan("opencode", proj) })
  await measure(`install (1x)`, async () => { await api.install("opencode", proj) })
  await measure(`verify (${runs}x)`, async () => { for (let i = 0; i < runs; i++) await api.verify("opencode", proj) })
  await measure(`health (${runs}x)`, async () => { for (let i = 0; i < runs; i++) await api.health("opencode", proj) })
  await measure(`doctor (${runs}x)`, async () => { for (let i = 0; i < runs; i++) await api.doctor("opencode", proj) })
  await measure(`rollback (1x)`, async () => { await api.rollback("opencode", "inst_bench", proj) })
  const allOk = Object.values(bench).every((b) => b.ok)
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), runs, allOk, bench }, null, 2))
  rmSync(work, { recursive: true, force: true })
  process.exit(allOk ? 0 : 1)
}
main().catch((e) => { console.error(e); process.exit(2) })
