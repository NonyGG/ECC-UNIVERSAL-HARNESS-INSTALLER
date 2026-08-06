## Summary
What this PR does and why.

## Type
- [ ] core
- [ ] contracts
- [ ] adapter-sdk
- [ ] adapter
- [ ] cli
- [ ] docs
- [ ] ci
- [ ] security

## Checklist
- [ ] No domain logic in adapters (workflow/graph/review/eval/cert/provider/
      competency/agents/teams/missions/OPS/EventStore/GraphStore)
- [ ] No per-harness rules in core (`node scripts/lint.mjs` clean)
- [ ] `tsc --noEmit` clean
- [ ] Tests green (`npm test`)
- [ ] Honest support classification (no unproven claims)
- [ ] No secrets / machine-specific paths
- [ ] Attribution for derived code (NOTICE)

## Testing
How this was verified.
