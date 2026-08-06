# Release Notes — v0.1.0

## ecc-universal-harness-installer 0.1.0

Initial release of the universal harness integration installer for the ECC
institutional runtime. Transforms the certified integration program
(`ECC-OPENCODE-INTEGRATION-1 → 6`) into a contract-based, installable
framework.

## Highlights

- Universal core (registry, detection, planning, transactional install,
  backup/rollback, manifest, verify, capability negotiation, discovery, event
  envelope, doctor) with **no per-harness rules**.
- Typed contracts; adapter SDK; thin adapters.
- OpenCode adapter (SUPPORTED, certified reference).
- `ecc-harness` CLI (detect/plan/install/verify/health/rollback/update/
  adapters/doctor/report; `--dry-run`, `--json`, `--yes`).
- Idempotent rollback; deterministic plans; no credentials stored.
- Tests: core 12/12, opencode adapter 5/5, operational proof 11/11, benchmark.
- CI (Windows + Linux) with lint, typecheck, tests, package, secret scan.

## Honest status

- Only OpenCode has operational proof. Claude Code / Codex / Cursor / Gemini
  are ADAPTER-READY (Tier 2). Others are ANALYSIS-ONLY / DEFERRED.
- `agentSelection`, `reviewComments`, `ui` are unsupported on the OpenCode
  adapter (never simulated).

## Checksums

Attached at release time by the owner (G7 / G15).
