# FAQ

**Does an adapter mean all ECC capabilities are active on that harness?**
No. Support is per-capability and verified. `agentSelection`, `reviewComments`
and `ui` are currently declared unsupported on the OpenCode adapter.

**Does the installer run the harness during detection?**
No. Detection is filesystem-only. Only an explicit safe version/health command
is ever permitted.

**Are credentials stored?**
No. No API keys, tokens, provider credentials, passwords or session content.
The manifest stores paths and metadata only.

**Is data transmitted externally?**
No. Detection and planning are fully local.

**Is the rollback safe?**
Yes: backup before every write, restore modified files exactly, remove only
owned files, preserve user files, idempotent (a second rollback is a no-op).

**Can I add a harness without touching the core?**
Yes. Implement an adapter implementing `UniversalHarnessAdapter` and register
it. The core contains no per-harness rules (enforced by `scripts/lint.mjs`).

**Why is OpenCode special?**
It is not — it is simply the first certified adapter, used as the reference
implementation. The core depends only on the `UniversalHarnessAdapter`
contract.

**Where does the domain authority live?**
Exclusively in the ECC institutional runtime (EventStore, GraphStore, Workflow,
Review, Evaluation, Certification, Provider, Competency, Agents, Teams,
Missions, OPS). The installer only connects a harness to that authority.
