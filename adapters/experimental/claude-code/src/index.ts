// Tier 2 (analysis + contract; fixture install only — NOT claimed SUPPORTED).
import { AdapterBase } from "@ecc-installer/adapter-sdk"
import type { HarnessDescriptor } from "@ecc-installer/contracts"

export class ClaudeCodeAdapter extends AdapterBase {
  descriptor: HarnessDescriptor = {
    id: "claude-code", name: "Claude Code", version: "0.1.0", executable: "claude",
    configurationPaths: [".claude/settings.json"], pluginPaths: [".claude/plugins"], skillsPaths: [".claude/skills"], commandsPaths: [".claude/commands"], agentsPaths: [".claude/agents"],
    lifecycleEvents: [], toolSurface: [], commandSurface: [], providerBoundary: "native", sessionBoundary: "native",
    supportsPlugins: true, supportsHooks: true, supportsSkills: true, supportsCommands: true, supportsAgents: true,
    supportsStreaming: true, supportsCancellation: true, supportsWorktrees: true, supportsProjectConfig: true, supportsGlobalConfig: true,
    installationMode: ["project", "user"], risk: "low", status: "ADAPTER-READY",
  }
  async detect(ctx) { return { harnessId: this.descriptor.id, detected: false, configFilesFound: [], pluginDirsFound: [], warnings: ["Tier 2: fixture analysis only"], evidence: ["analysis-only"] } }
  async inspect() { return { tier: 2 } }
  async validate() { return { harnessId: this.descriptor.id, compatible: false, capabilities: { tools: true, commands: true, hooks: true, sessionLifecycle: true, cancellation: true, streaming: true, fileEvents: false, worktrees: true, providerSelection: true, agentSelection: false, reviewComments: false, ui: false }, levelByCapability: {}, blockers: ["not implemented: Tier 2 analysis"], warnings: ["ADAPTER-READY, not SUPPORTED"], evidence: ["tier-2"] } }
  async planInstallation() { throw new Error("not implemented") }
  async install() { throw new Error("not implemented") }
  async verify() { throw new Error("not implemented") }
  async update() { throw new Error("not implemented") }
  async rollback() { throw new Error("not implemented") }
  async health() { return { harnessId: this.descriptor.id, harnessDetected: false, eccRootResolved: false, eccApiImportable: false, bridgeInstalled: false, bridgeHealthy: false, workflowAvailable: false, graphAvailable: false, opsAvailable: false, manifestPresent: false, driftDetected: false, warnings: ["not installed"] } }
}
