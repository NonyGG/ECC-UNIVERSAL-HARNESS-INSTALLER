# Contributing

## Principles

- **Thin adapters**: adapters never implement domain logic (workflow, graph,
  review, evaluation, certification, provider, competency, agents, teams,
  missions, OPS, EventStore, GraphStore). Those belong to the ECC institutional
  runtime.
- **No per-harness rules in core**: selection happens via the adapter registry
  and contracts. The core must remain harness-agnostic (verified by
  `scripts/lint.mjs`).
- **Honest support**: never claim support that is not operationally proven.
  Classify as SUPPORTED / SUPPORTED-WITH-CONDITIONS / ADAPTER-READY /
  ANALYSIS-ONLY / DEFERRED / UNSUPPORTED.
- **Safety first**: `--dry-run` before any write; backup before overwrite;
  idempotent rollback; no credentials stored; no external transmission.

## Adding a harness adapter

1. Copy `adapters/experimental/claude-code` as a skeleton.
2. Implement detection, validation, plan, install, verify, update, rollback,
   health against the `UniversalHarnessAdapter` contract.
3. Provide fixture-based tests under `tests/`.
4. Set `status` honestly (start at ADAPTER-READY or ANALYSIS-ONLY).
5. Only promote to SUPPORTED after operational proof + certification.

## Contribution checklist

- [ ] Follows the adapter contract
- [ ] No domain logic in the adapter
- [ ] Tests green (`npm test`)
- [ ] `node scripts/lint.mjs` clean
- [ ] `tsc --noEmit` clean
- [ ] No secrets, no machine-specific paths
- [ ] Attribution for any derived code (see NOTICE)
