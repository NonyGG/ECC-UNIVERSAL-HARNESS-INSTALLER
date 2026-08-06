# ECC-UNIVERSAL-HARNESS-INSTALLER-1 — Certification

## Respostas objetivas (Etapa 39)

- Processo transformado em **código** (contratos, classes, adapters, CLI, manifests, testes, políticas, gates, rollback, CI), não apenas prompts ✓
- Core universal sem regras por harness ✓ (enforced por `scripts/lint.mjs`)
- Adapter SDK ✓ · adapters finos ✓ (OpenCode adapter só detecta/traduz/encaminha/health)
- OpenCode adapter reproduz a Integration-6 via installer (prova operacional 11/11) ✓
- Discovery universal (precedência project>worktree>plugin>ecc) ✓
- Event translation contratual (envelope + redaction) ✓
- Instalação transacional (validate→backup→stage→write→configure→verify→certify→manifest) ✓
- Backup antes de escrita ✓ · rollback idempotente ✓ · update versionado ✓ · uninstall preserva arquivos do usuário ✓
- Manifesto completo ✓ · doctor detecta drift ✓ · nenhuma credencial armazenada ✓
- Nenhum runtime paralelo criado ✓ · EventStore/GraphStore permanecem no ECC (autoridade única) ✓
- OpenCode permanece harness ✓ · outros harnesses entram via registry sem alterar core ✓
- Suporte não testado declarado honestamente (Tier 2 = ADAPTER-READY; demais ANALYSIS-ONLY/DEFERRED) ✓
- OpenCode testado operacionalmente ✓ · build determinístico (tsc + lint + tsx) ✓ · CI configurado (GitHub Actions, Windows+Linux, sem credenciais de provider) ✓
- Licenciamento resolvido (MIT + NOTICE) ✓ · security review (gates no CI: secret scan + lint) ✓
- Repositório local completo ✓ · rollback da publicação possui plano (gates G1–G15) ✓

## Gates de publicação

G1 core tests green ✓ (12/12) · G2 OpenCode adapter certified ✓ (5/5) ·
G3 install/verify/rollback green ✓ (prova 11/11) · G4 no secrets ✓ ·
G5 licenses resolved ✓ · G6 deterministic build ✓ · G7 package content ✓ ·
G8 Windows test green ✓ · G9 Linux test green — **pendente (CI remoto)** ·
G10 documentation complete ✓ · G11 security review ✓ · G12 history clean ✓ ·
G13 owner confirmed visibility — **pendente** · G14 owner confirmed license —
**pendente** · G15 remote publication verified — **pendente**.

## Status

```
ECC UNIVERSAL HARNESS INSTALLER LOCALLY CERTIFIED
GITHUB PUBLICATION AWAITING OWNER CONFIGURATION
```

Publicação GitHub não executada: requer confirmação explícita do owner sobre
public/private, organização/usuário de destino, nome final e licença
(per Etapa 36). Repositório local completo em
`C:\Users\DJONY\ecc-universal-harness-installer` (git init, commit inicial).

## Warnings aceitos

1. OpenCode é o único harness com prova operacional real; Claude Code / Codex /
   Cursor / Gemini são ADAPTER-READY (Tier 2, fixture); demais ANALYSIS-ONLY.
2. CI Linux/macOS e a publicação remota dependem de ambiente/owner.
3. Bridge instalada é fina e delega domínios ao ECC — agent selection, review
   comments e UI declarados unsupported no OpenCode adapter.
