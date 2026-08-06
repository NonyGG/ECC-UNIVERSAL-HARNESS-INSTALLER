# ecc-universal-harness-installer

Universal harness integration installer for the **ECC institutional runtime**.

This repository transforms the certified integration program
(`ECC-OPENCODE-INTEGRATION-1 → 6`) into a **harness-agnostic, contract-based,
installable framework**. It detects a harness, plans a transactional install of
a minimal bridge, connects the ECC Institutional Public API, verifies the
result, produces evidence, and supports rollback, update and uninstall.

## Architecture

```
Harness
  → Harness Adapter (thin, per-harness)
  → Universal Bridge Contract
  → ECC Public Institutional API (dist/institutional)
  → Institutional Runtime
```

- **Core** (`packages/core`): registry, detection, planning, transactional
  install, backup/rollback, manifest, verify, capabilities negotiation,
  universal discovery, event envelope, doctor. Contains **no per-harness rules**
  and no `if (harness === "...")`.
- **Contracts** (`packages/contracts`): typed contracts shared by core,
  adapters and CLI.
- **Adapter SDK** (`packages/adapter-sdk`): interface + base helpers for
  writing thin adapters.
- **Adapters** (`adapters/`): thin per-harness adapters (detect lifecycle,
  translate events, resolve roots, forward calls, present health).
- **CLI** (`packages/cli`): `ecc-harness` command.

Adapters must **never** implement domain logic (workflow, graph, review,
evaluation, certification, provider resilience, competency, agents, teams,
missions, OPS, EventStore, GraphStore). All domain logic belongs to the ECC.

> **The existence of an adapter does not mean all ECC capabilities are active
> in that harness.** Support is declared per-capability, honestly, and only
> after operational proof where claimed.

## Harness support (honest status)

| Harness     | Status                     | Proof |
|-------------|----------------------------|-------|
| OpenCode    | SUPPORTED (certified)      | operational trace (mirrors ECC-OPENCODE-INTEGRATION-6) |
| Claude Code | ADAPTER-READY (Tier 2 fixture) | contract + fixture planned |
| Codex CLI   | ADAPTER-READY (Tier 2 fixture) | contract + fixture planned |
| Cursor      | ADAPTER-READY (Tier 2 fixture) | contract + fixture planned |
| Gemini CLI  | ADAPTER-READY (Tier 2 fixture) | contract + fixture planned |
| Others (VS Code, Windsurf, Cline, Roo, Continue, Zed, Antigravity, Qwen, Kimi, CodeBuddy, JoyCode, Hermes, OpenClaw) | ANALYSIS-ONLY / DEFERRED | not claimed |

An adapter existing does not imply ECC capabilities are active on that harness.

## Installer CLI

```bash
ecc-harness detect
ecc-harness plan --harness opencode --ecc-root ../ECC
ecc-harness install --harness opencode --scope user --dry-run
ecc-harness install --harness opencode --scope user --yes
ecc-harness verify --harness opencode
ecc-harness health --harness opencode
ecc-harness rollback --installation <id>
ecc-harness uninstall --harness opencode
ecc-harness doctor
ecc-harness adapters
ecc-harness report
```

Always run `--dry-run` before any write. Use `--json` for stable output.
Destructive writes are never assumed confirmed.

## Security & privacy

- No credentials, API keys, tokens or session content are ever stored.
- No external data transmission during detection.
- No untrusted remote code execution; adapters are allowlisted and shipped
  with the installer.
- Every write is preceded by backup and covered by an idempotent rollback.

## Development

See `docs/architecture/ARCHITECTURE.md`, `docs/adapters/`, and
`CONTRIBUTING.md`.

## License

MIT. See `LICENSE` and `NOTICE`.
