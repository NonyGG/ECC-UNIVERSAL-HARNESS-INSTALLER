// Minimal structural lint: core must not contain per-harness rules; no secrets.
import { readFileSync } from "node:fs"
import { join } from "node:path"
const ROOT = process.cwd()
const src = readFileSync(join(ROOT, "packages", "core", "src", "index.ts"), "utf8")
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/[^\n]*/g, "")
  .replace(/`[^`]*`/g, "")
  .replace(/"[^"\n]*"/g, "")
let failures = 0
for (const [label, re] of [["if (harness", /\bif\s*\(\s*harness/], ["switch (harness", /\bswitch\s*\(\s*harness/], ["case opencode", /\bcase\s*["']opencode/]]) {
  if (re.test(code)) { console.log(`CORE HARNESS RULE: ${label}`); failures++ }
}
if (/(sk-proj-|ghp_[A-Za-z0-9]{20,}|BEGIN (RSA |OPENSSH )?PRIVATE KEY)/.exec(src)) { console.log("SECRET FOUND"); failures++ }
if (!src.includes("HarnessAdapterRegistry")) { console.log("registry missing"); failures++ }
console.log(failures === 0 ? "lint: clean" : `lint: ${failures} failure(s)`)
process.exit(failures ? 1 : 0)
