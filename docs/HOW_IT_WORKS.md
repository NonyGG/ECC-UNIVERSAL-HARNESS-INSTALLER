# How It Works

## Lifecycle of an install

```
ecc-harness detect
  → adapter.detect()          (filesystem only; never runs the harness)
ecc-harness plan
  → adapter.planInstallation() (deterministic, reviewable)
ecc-harness install
  → validate → backup → stage → write → configure → verify → certify
    → manifest (.ecc-integration/installation.json)
ecc-harness verify / health
  → bridge imports ECC API; manifest present; no drift
ecc-harness rollback
  → restore modified from backups → remove owned files → remove integration dir
    (idempotent; second rollback is a no-op)
```

## Where the authority lives

The installer never owns domain logic. It writes a **thin bridge** that imports
the ECC Institutional Public API (`dist/institutional`) and forwards calls.
Workflow, graph, review, evaluation, certification, provider governance,
competencies, agents, teams, missions and OPS remain exclusively in the ECC
institutional runtime.

## Universal vs harness-specific

- **Universal (core)**: root resolution, planning, transactional install,
  backup/rollback, manifest, verify, capability negotiation, discovery,
  event envelope, doctor. No per-harness rules.
- **Harness-specific (adapters)**: lifecycle detection, event translation,
  tool/command registration, root reporting, health. Adapters are thin.

## Capability honesty

A harness declares capabilities; the core negotiates levels
(`enabled` / `enabled-with-conditions` / `validation-only` / `deferred` /
`unsupported`). A missing capability is never simulated. An adapter existing
does **not** mean all ECC capabilities are active on that harness.
