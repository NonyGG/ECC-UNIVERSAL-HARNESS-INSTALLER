import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { createHash } from "node:crypto"
import type { UniversalHarnessAdapter, InstallContext, HarnessDetectionResult, HarnessCompatibility, UniversalInstallationPlan, InstallResult, HarnessHealth, RollbackResult, VerifyContext, UpdateContext, RollbackContext, HarnessRollbackPlan } from "@ecc-installer/contracts"

export { UniversalHarnessAdapter }
export type { InstallContext, HarnessDetectionResult, HarnessCompatibility, UniversalInstallationPlan, InstallResult, HarnessHealth, RollbackResult, VerifyContext, UpdateContext, RollbackContext }

export const INTEGRATION_DIR = ".ecc-integration"
export const MANIFEST_FILE = "installation.json"

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex")
}
export function fileHash(p: string): string {
  return existsSync(p) ? sha256(readFileSync(p, "utf8")) : ""
}
export function integrationDir(base: string): string {
  return join(base, INTEGRATION_DIR)
}
export function backupsDir(base: string): string {
  return join(integrationDir(base), "backups")
}
export function manifestPath(base: string): string {
  return join(integrationDir(base), MANIFEST_FILE)
}

export abstract class AdapterBase implements UniversalHarnessAdapter {
  abstract descriptor: UniversalHarnessAdapter["descriptor"]
  abstract detect(ctx: InstallContext): Promise<HarnessDetectionResult>
  abstract inspect(ctx: InstallContext): Promise<Record<string, unknown>>
  abstract validate(ctx: InstallContext): Promise<HarnessCompatibility>
  abstract planInstallation(ctx: InstallContext): Promise<UniversalInstallationPlan>
  abstract install(ctx: InstallContext): Promise<InstallResult>
  abstract verify(ctx: VerifyContext): Promise<HarnessHealth>
  abstract update(ctx: UpdateContext): Promise<InstallResult>
  abstract rollback(ctx: RollbackContext): Promise<RollbackResult>
  abstract health(ctx: InstallContext): Promise<HarnessHealth>

  protected targetRoot(ctx: InstallContext): string {
    return ctx.scope === "project" ? ctx.projectDir || "." : ctx.userDir || ctx.globalDir || "."
  }

  /** Back up an existing file (copy + hash) before any overwrite. */
  protected backupFile(base: string, targetAbs: string, relative: string): { path: string; backup: string; hash: string } {
    const bdir = backupsDir(base)
    const backup = join(bdir, `${relative.replace(/[^a-zA-Z0-9-_/.]/g, "_")}.bak`)
    mkdirSync(dirname(backup), { recursive: true })
    if (existsSync(targetAbs)) copyFileSync(targetAbs, backup)
    return { path: relative, backup, hash: fileHash(targetAbs) }
  }

  /** Write an owned file atomically and record it. */
  protected writeOwned(base: string, targetAbs: string, relative: string, content: string, owned: string[], modified: { path: string; backup: string; hash: string }[]) {
    const prev = this.backupFile(base, targetAbs, relative)
    mkdirSync(dirname(targetAbs), { recursive: true })
    writeFileSync(targetAbs, content, "utf8")
    owned.push(relative)
    if (existsSync(prev.backup)) modified.push(prev)
  }

  protected buildRollbackPlan(base: string, owned: string[], modified: { path: string; backup: string; hash: string }[]): HarnessRollbackPlan {
    return { backupsDir: backupsDir(base), ownedFiles: [...owned], modifiedFiles: [...modified], steps: ["restore modified from backups", "remove owned files", "remove integration dir"] }
  }

  /** Restore exactly: copy backups back, then remove owned files (idempotent). */
  protected applyRollback(base: string, targetRoot: string, plan: HarnessRollbackPlan, ctx: RollbackContext): RollbackResult {
    const restored: string[] = []
    const removedOwned: string[] = []
    for (const m of plan.modifiedFiles) {
      const abs = resolve(targetRoot, m.path)
      if (existsSync(m.backup)) {
        copyFileSync(m.backup, abs)
        restored.push(m.path)
      }
    }
    for (const f of plan.ownedFiles) {
      const abs = resolve(targetRoot, f)
      if (existsSync(abs)) { rmSync(abs, { force: true }); removedOwned.push(f) }
    }
    // only remove the integration dir if we created it and it is now empty of meaningful state
    const iDir = integrationDir(base)
    if (existsSync(iDir) && ctx.installationId) rmSync(iDir, { recursive: true, force: true })
    return { installationId: ctx.installationId, rolledBack: true, restored, removedOwned, preservedUserFiles: [], warnings: [], evidence: [`rollback:${ctx.installationId}`] }
  }
}
