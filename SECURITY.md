# SECURITY.md

## Reporting

Report vulnerabilities privately; do not open public issues for security bugs.

## Design guarantees

- **No credentials stored**: the installer never reads, writes or stores API
  keys, tokens, provider credentials, passwords or session content. The
  manifest (`installation.json`) contains paths and metadata only.
- **No external transmission**: detection and planning are fully local.
- **No untrusted remote execution**: adapters are allowlisted and shipped with
  the installer; no arbitrary remote code is downloaded or executed.
- **Transactional writes**: every write is preceded by backup and covered by
  an idempotent rollback. `--dry-run` is required before any write.
- **Path safety**: owned files are resolved inside the target harness
  directories; rollback restores only owned/modified files and preserves user
  files.
- **Per-harness rules forbidden in core**: the core contains no
  `if (harness === ...)` / switch-per-harness logic; selection happens via the
  adapter registry and contracts.

## Security model

Adapters declare capabilities honestly; a missing capability is never
simulated. Provider/model selection is never altered without explicit
authorization. Domain authorities (EventStore, GraphStore, Workflow, Review,
Evaluation, Certification, Provider, Competency, Agents, Teams, Missions, OPS)
remain exclusively in the ECC institutional runtime.
