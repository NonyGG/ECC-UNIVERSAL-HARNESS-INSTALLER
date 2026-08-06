export type HarnessSupportStatus = "SUPPORTED" | "SUPPORTED-WITH-CONDITIONS" | "ADAPTER-READY" | "ANALYSIS-ONLY" | "DEFERRED" | "UNSUPPORTED"
export type CapabilityLevel = "enabled" | "enabled-with-conditions" | "validation-only" | "deferred" | "unsupported"
export type InstallScope = "project" | "user" | "global" | "portable" | "dry-run" | "verify-only" | "repair" | "update" | "rollback" | "uninstall"
export type InstallationStatus = "INSTALLED" | "INSTALLED-WITH-WARNINGS" | "PARTIALLY-INSTALLED" | "BLOCKED" | "ROLLED-BACK" | "UNINSTALLED" | "DRIFTED" | "REPAIR-REQUIRED"
export type RiskLevel = "low" | "medium" | "high"

export interface HarnessDescriptor {
  id: string
  name: string
  version: string
  executable?: string
  configurationPaths: string[]
  pluginPaths: string[]
  skillsPaths: string[]
  commandsPaths: string[]
  agentsPaths: string[]
  lifecycleEvents: string[]
  toolSurface: string[]
  commandSurface: string[]
  providerBoundary: "native" | "ecc-advised" | "none"
  sessionBoundary: "native" | "ecc-observed" | "none"
  supportsPlugins: boolean
  supportsHooks: boolean
  supportsSkills: boolean
  supportsCommands: boolean
  supportsAgents: boolean
  supportsStreaming: boolean
  supportsCancellation: boolean
  supportsWorktrees: boolean
  supportsProjectConfig: boolean
  supportsGlobalConfig: boolean
  installationMode: InstallScope[]
  risk: RiskLevel
  status: HarnessSupportStatus
}

export interface HarnessDetectionResult {
  harnessId: string
  detected: boolean
  version?: string
  configFilesFound: string[]
  pluginDirsFound: string[]
  globalDir?: string
  projectDir?: string
  warnings: string[]
  evidence: string[]
}

export interface HarnessCapabilities {
  tools: boolean
  commands: boolean
  hooks: boolean
  sessionLifecycle: boolean
  cancellation: boolean
  streaming: boolean
  fileEvents: boolean
  worktrees: boolean
  providerSelection: boolean
  agentSelection: boolean
  reviewComments: boolean
  ui: boolean
}

export interface HarnessCompatibility {
  harnessId: string
  compatible: boolean
  capabilities: HarnessCapabilities
  levelByCapability: Record<string, CapabilityLevel>
  blockers: string[]
  warnings: string[]
  eccVersion?: string
  eccApiImportable?: boolean
  evidence: string[]
}

export interface PlanOperation {
  kind: "write" | "delete" | "mkdir" | "config-merge" | "command"
  target: string
  content?: string
  owned: boolean
}

export interface HarnessRollbackPlan {
  backupsDir: string
  ownedFiles: string[]
  modifiedFiles: { path: string; backup: string; hash: string }[]
  steps: string[]
}

export interface UniversalInstallationPlan {
  planId: string
  harness: string
  harnessVersion: string
  eccVersion: string
  eccRoot: string
  targetScope: InstallScope
  operations: PlanOperation[]
  configChanges: string[]
  directories: string[]
  permissions: string[]
  preconditions: string[]
  postconditions: string[]
  verification: string[]
  rollback: HarnessRollbackPlan
  risk: RiskLevel
  warnings: string[]
  blockers: string[]
  evidence: string[]
  createdAt: string
}

export interface InstallResult {
  installationId: string
  status: InstallationStatus
  planId: string
  filesWritten: string[]
  filesBackedUp: string[]
  configChanges: string[]
  warnings: string[]
  blockers: string[]
  evidence: string[]
  certification: string
}

export interface RollbackResult {
  installationId: string
  rolledBack: boolean
  restored: string[]
  removedOwned: string[]
  preservedUserFiles: string[]
  warnings: string[]
  evidence: string[]
}

export interface HarnessHealth {
  harnessId: string
  harnessDetected: boolean
  eccRootResolved: boolean
  eccApiImportable: boolean
  bridgeInstalled: boolean
  bridgeHealthy: boolean
  workflowAvailable: boolean
  graphAvailable: boolean
  opsAvailable: boolean
  manifestPresent: boolean
  driftDetected: boolean
  lastVerifiedAt?: string
  warnings: string[]
}

export interface HarnessEventEnvelope {
  eventId: string
  harnessId: string
  harnessVersion: string
  eventType: string
  nativeEventType: string
  sessionId: string
  projectId?: string
  worktreeId?: string
  correlationId?: string
  causationId?: string | null
  timestamp: string
  actor?: string
  tool?: string
  status: string
  sanitizedPayload: Record<string, unknown>
  schemaVersion: 1
}

export interface HarnessEvidence {
  installationId: string
  planId: string
  detectedAt: string
  installedAt?: string
  verifiedAt?: string
  health: HarnessHealth
  testsRun: string[]
  testResults: { name: string; passed: boolean; detail?: string }[]
}

export interface HarnessCertificationResult {
  harnessId: string
  installerVersion: string
  certified: boolean
  status: InstallationStatus
  evidence: string[]
  warnings: string[]
  gates: Record<string, boolean>
}

export interface InstallationManifest {
  installationId: string
  installerVersion: string
  eccVersion: string
  eccHash: string
  harness: string
  harnessVersion: string
  scope: InstallScope
  adapter: string
  adapterVersion: string
  filesOwned: string[]
  filesModified: { path: string; backup: string }[]
  backups: string[]
  configChanges: string[]
  capabilitiesEnabled: string[]
  capabilitiesDeferred: string[]
  installedAt: string
  lastVerifiedAt?: string
  health?: HarnessHealth
  certification?: string
}

export interface UniversalHarnessAdapter {
  descriptor: HarnessDescriptor
  detect(ctx: InstallContext): Promise<HarnessDetectionResult>
  inspect(ctx: InstallContext): Promise<Record<string, unknown>>
  validate(ctx: InstallContext): Promise<HarnessCompatibility>
  planInstallation(ctx: InstallContext): Promise<UniversalInstallationPlan>
  install(ctx: InstallContext): Promise<InstallResult>
  verify(ctx: VerifyContext): Promise<HarnessHealth>
  update(ctx: UpdateContext): Promise<InstallResult>
  rollback(ctx: RollbackContext): Promise<RollbackResult>
  health(ctx: InstallContext): Promise<HarnessHealth>
}

export interface InstallContext {
  harnessId: string
  scope: InstallScope
  eccRoot: string
  projectDir?: string
  userDir?: string
  globalDir?: string
  dryRun: boolean
  yes: boolean
  strict: boolean
  noNetwork: boolean
  config?: Record<string, unknown>
}
export interface VerifyContext extends InstallContext { installationId: string }
export interface UpdateContext extends InstallContext { fromVersion: string; toVersion: string }
export interface RollbackContext { installationId: string; dryRun: boolean; yes: boolean; baseDir?: string }
