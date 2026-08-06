# Adapter Guide

## When a new harness is added

1. Create `adapters/<harness>/` implementing `UniversalHarnessAdapter`.
2. Classify honestly first (ADAPTER-READY / ANALYSIS-ONLY).
3. Promote to SUPPORTED only after operational proof + certification.

## Checklist for a new adapter

- [ ] Descriptor declares id, version, paths, lifecycle events, capability flags
- [ ] `detect()` is filesystem-only (never executes the harness)
- [ ] `validate()` checks ECC API importability and compatibility
- [ ] `planInstallation()` is deterministic (no timestamps in the plan shape)
- [ ] `install()` backs up before writing; writes only owned files
- [ ] `verify()` checks bridge import + health + manifest
- [ ] `rollback()` is idempotent and preserves user files
- [ ] `health()` reflects real state (no false healthy)
- [ ] Capability negotiation is honest (no simulated capabilities)
- [ ] No domain logic (workflow/graph/review/eval/cert/provider/competency/
      agents/teams/missions/OPS/EventStore/GraphStore)
- [ ] No credentials stored; no external transmission
- [ ] Fixture tests pass; lint clean; typecheck clean

## Reference

`adapters/opencode` is the certified reference implementation (mirrors
ECC-OPENCODE-INTEGRATION-1 → 6 through the universal installer).

> **The existence of an adapter does not mean all ECC capabilities are active
> in that harness.** Support is declared per-capability and verified.
