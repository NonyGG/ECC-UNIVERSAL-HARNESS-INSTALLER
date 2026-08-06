# Changelog

## 0.1.0 (2026-08-06)

- Universal core: adapter registry, ECC root resolution, deterministic
  planning, transactional install (validate → backup → stage → write →
  configure → verify → certify → manifest), idempotent backup/rollback,
  installation manifest, verify, capability negotiation, universal discovery
  (project > worktree > plugin > institutional), event envelope with secret
  redaction, doctor.
- Typed contracts (`packages/contracts`).
- Adapter SDK (`packages/adapter-sdk`).
- CLI `ecc-harness` (detect/inspect/plan/install/verify/health/rollback/
  update/adapters/doctor/report/discover/envelope; `--dry-run`, `--json`,
  `--yes`, `--strict`, `--no-network`).
- OpenCode adapter (SUPPORTED, certified reference mirroring
  ECC-OPENCODE-INTEGRATION-1 → 6): thin bridge that forwards to the ECC public
  institutional API.
- Tier 2 skeleton adapter for Claude Code (ADAPTER-READY, analysis only).
- Tests: core 12/12, opencode adapter 5/5, operational proof 11/11.
- CI (GitHub Actions: Windows + Linux, tests, lint, typecheck, package,
  secret scan).
- Docs, LICENSE (MIT), NOTICE, SECURITY.
