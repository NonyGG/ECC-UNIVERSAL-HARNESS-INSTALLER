# SDK Guide

`packages/adapter-sdk` provides the base for thin adapters.

## Base class

```ts
import { AdapterBase } from "@ecc-installer/adapter-sdk"
import type { HarnessDescriptor } from "@ecc-installer/contracts"

export class MyAdapter extends AdapterBase {
  descriptor: HarnessDescriptor = { /* id, paths, capabilities, status */ }
  async detect(ctx) { /* filesystem-only */ }
  async validate(ctx) { /* ECC API importable + compatible */ }
  async planInstallation(ctx) { /* deterministic plan */ }
  async install(ctx) { /* backup → write owned → manifest */ }
  async verify(ctx) { /* bridge import + health + manifest */ }
  async rollback(ctx) { /* idempotent restore + remove owned */ }
  async health(ctx) { /* real state */ }
}
```

## Helpers provided

- `backupFile(base, targetAbs, relative)` — copies + hashes before overwrite.
- `writeOwned(...)` — atomically writes and records owned files.
- `buildRollbackPlan(...)` / `applyRollback(...)` — idempotent rollback.
- `integrationDir`, `backupsDir`, `manifestPath`, `fileHash`, `sha256`.

## Registration

```ts
import { createInstaller } from "@ecc-installer/core"
import { MyAdapter } from "@ecc-installer/my-harness"
const api = createInstaller({ eccRoot: "path/to/ecc" })
api.registry.register(new MyAdapter())
```

Adapters enter via the registry — the core never changes.
