# Architecture

## Layers

```
Harness
  → Harness Adapter (thin)
  → Universal Bridge Contract
  → ECC Public Institutional API (dist/institutional)
  → Institutional Runtime
```

## Principles

- **Harness-agnostic core**: `packages/core` contains registry, detection,
  planning, transactional install, backup/rollback, manifest, verify,
  capability negotiation, universal discovery, event envelope and doctor. It
  contains **no per-harness rules** (enforced by `scripts/lint.mjs`).
- **Thin adapters**: an adapter only detects lifecycle, translates events,
  exposes tools/commands, resolves roots, forwards calls and presents health.
  It must never implement domain logic (workflow, graph, review, evaluation,
  certification, provider resilience, competency, agents, teams, missions,
  OPS, EventStore, GraphStore).
- **Selection by registry**: adapters register by deterministic id; future
  harnesses enter without modifying the core.
- **Honest capability negotiation**: a missing capability is never simulated.
- **Transactional writes**: validate → backup → stage → write → configure →
  verify → certify → manifest; any failure rolls back idempotently.
- **Authority**: the ECC institutional runtime remains the sole authority for
  all domains. The installer only connects a harness to that authority.

## Universal bridge contract

The installed bridge exposes: `start`, `stop`, `health`, `discover`,
`listWorkflows`, `runWorkflow`, `cancelWorkflow`, `graphQuery`, `startReview`,
`providerDecision`, `selectAgents`, `createMission`, `opsSnapshot`. Each method
forwards to the ECC institutional API; no domain logic lives in the bridge.

## Discovery precedence

project > worktree > harness/plugin > ECC institutional.

## Packaging choice

npm workspaces (see `package.json` + `pnpm-workspace.yaml`). pnpm is declared
for environments that prefer it; npm is used by default because it is available
everywhere with zero extra tooling. The choice follows real infrastructure.
