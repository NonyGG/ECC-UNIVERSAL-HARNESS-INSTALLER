# Limitations

Honest, current as of 0.1.0.

- **Only OpenCode is operationally proven** (SUPPORTED). Claude Code, Codex,
  Cursor and Gemini are ADAPTER-READY (Tier 2, fixture analysis). All other
  harnesses listed in the mission are ANALYSIS-ONLY / DEFERRED — support is
  **not claimed**.
- **Capabilities are per-harness**: on OpenCode, `agentSelection`,
  `reviewComments` and `ui` are declared unsupported and not simulated.
- **Platform coverage**: CI runs Windows and Linux; macOS and WSL are not yet
  CI-verified.
- **Large-scale benchmarks** (10k+ decisions, many concurrent installs) are not
  yet published; the shipped benchmark measures the core paths on fixtures.
- **GitHub publication** awaits explicit owner configuration (visibility,
  target org/user, final name, license). Nothing is published automatically.
- **No persistence beyond process lifetime** for installation state; the
  manifest is the local record.
- **Adapter certification pipeline** requires operational proof per harness
  before promotion to SUPPORTED.

These limits are deliberate and never hidden to reach a certification.
