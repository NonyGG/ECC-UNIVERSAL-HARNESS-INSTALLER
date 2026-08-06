# OpenCode Adapter (certified reference)

Status: **SUPPORTED**. This adapter reproduces the certified integration
`ECC-OPENCODE-INTEGRATION-1 → 6` through the universal installer.

## What it does

- Detects OpenCode (config files, `.opencode/plugins`).
- Validates ECC institutional API importability.
- Plans a deterministic install of a **thin** bridge
  (`.opencode/plugins/bridge/universal-bridge.mjs`) that forwards to the ECC
  public API.
- Backs up, installs, verifies, and rolls back idempotently.
- Never implements domain logic; never stores credentials.

## Declared capabilities (honest)

enabled: tools, commands, hooks, sessionLifecycle, cancellation, streaming,
fileEvents, worktrees, providerSelection.
unsupported (deferred): agentSelection, reviewComments, ui.

> **An adapter existing does not imply all ECC capabilities are active in the
> harness.** Support is per-capability and verified in the fixture tests.
