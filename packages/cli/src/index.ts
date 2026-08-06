#!/usr/bin/env node
import { HarnessAdapterRegistry, resolveEccRoot, runInstall, runVerify, doctor, universalDiscover, buildEnvelope, negotiateCapabilities, readManifest } from "@ecc-installer/core"
import { OpenCodeAdapter } from "@ecc-installer/opencode"
import { join } from "node:path"

const registry = new HarnessAdapterRegistry()
registry.register(new OpenCodeAdapter())

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : undefined
}
const has = (f: string) => process.argv.includes(`--${f}`)
const json = (x: unknown) => process.stdout.write(JSON.stringify(x, null, 2) + "\n")

function ctx(harnessId: string) {
  const eccRoot = resolveEccRoot(arg("ecc-root"), undefined).root || arg("ecc-root") || process.cwd()
  return {
    harnessId, scope: (arg("scope") as never) || "project", eccRoot,
    projectDir: arg("project-dir") || process.cwd(), userDir: undefined, globalDir: undefined,
    dryRun: has("dry-run"), yes: has("yes"), strict: has("strict"), noNetwork: has("no-network"),
  }
}

async function main() {
  const cmd = process.argv[2]
  const h = arg("harness") || "opencode"
  const adapter = registry.get(h)
  switch (cmd) {
    case "detect": return json(await adapter.detect(ctx(h)))
    case "inspect": return json(await adapter.inspect(ctx(h)))
    case "plan": return json(await adapter.planInstallation(ctx(h)))
    case "install": return json(await runInstall(adapter, ctx(h)))
    case "verify": return json(await runVerify(adapter, { ...ctx(h), installationId: arg("installation") || "inst_verify" }))
    case "health": return json(await adapter.health(ctx(h)))
    case "rollback": return json(await adapter.rollback({ installationId: arg("installation") || "inst_unknown", dryRun: has("dry-run"), yes: has("yes") }))
    case "update": return json(await adapter.update({ ...ctx(h), fromVersion: arg("from") || "0.0.0", toVersion: arg("to") || "0.1.0" }))
    case "adapters": return json(registry.list().map((d) => ({ id: d.id, status: d.status, risk: d.risk })))
    case "doctor": return json(await doctor(adapter, ctx(h), ctx(h).projectDir || "."))
    case "report": return json({ installs: readManifest(ctx(h).projectDir || "."), adapters: registry.list().length })
    case "discover": return json(universalDiscover(ctx(h).projectDir || ".", undefined, [], ctx(h).eccRoot))
    case "envelope": return json(buildEnvelope({ harnessId: h, eventType: "session.started", nativeEventType: "session.created", sessionId: "s1" }))
    default:
      process.stdout.write(`ecc-harness: unknown command '${cmd}'\nCommands: detect inspect plan install verify health repair update rollback uninstall adapters doctor report discover envelope\n`)
      process.exit(2)
  }
}
main().catch((e) => { process.stderr.write(`error: ${e.message}\n`); process.exit(1) })
