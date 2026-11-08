import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "scripts/verify-agent-docs.mjs"), "utf8");
const scratch = process.env.RUNNER_TEMP || process.env.TMPDIR || tmpdir();

function verify(markdown) {
  const fixture = mkdtempSync(join(scratch, "agent-docs-test-"));
  for (const path of ["scripts", "docs", ".agents", ".github/skills", ".claude"]) {
    mkdirSync(join(fixture, path), { recursive: true });
  }
  writeFileSync(join(fixture, "scripts/verify-agent-docs.mjs"), source);
  symlinkSync(join(root, "node_modules"), join(fixture, "node_modules"), "dir");
  writeFileSync(join(fixture, "AGENTS.md"), "# Instructions\n");
  writeFileSync(join(fixture, "README.md"), "# Readme\n");
  writeFileSync(join(fixture, "GLOSSARY.md"), "# Glossary\n");
  writeFileSync(join(fixture, "docs/fixture.md"), markdown);
  writeFileSync(join(fixture, ".claude/settings.json"), readFileSync(join(root, ".claude/settings.json")));
  return spawnSync(process.execPath, [join(fixture, "scripts/verify-agent-docs.mjs")], { encoding: "utf8" });
}

test("reference links expose missing targets", () => {
  const broken = verify("[broken][target]\n\n[target]: missing.md\n");
  assert.notEqual(broken.status, 0, "a broken reference must fail the CLI");
  assert.match(broken.stderr, /missing\.md/);
});

test("angle-bracket link destinations resolve", () => {
  const valid = verify("[valid](<../README.md>)\n");
  assert.equal(valid.status, 0, valid.stderr);
});

test("nested shorter fences and inline-code examples do not become links", () => {
  const result = verify("````markdown\n```text\n[example](missing.md)\n```\n````\n\n`[inline](missing.md)`\n");
  assert.equal(result.status, 0, result.stderr);
});

test("heading links use rendered text and GitHub duplicate collision anchors", () => {
  const result = verify("# A [guide](../README.md)\n\n[jump](#a-guide)\n\n# Same\n# Same\n# Same-1\n# Same\n\n[collision](#same-1-1)\n[last](#same-2)\n");
  assert.equal(result.status, 0, result.stderr);
});

test("heading anchors omit HTML nodes without stripping tag-like inline code", () => {
  const valid = verify("# A <em>guide</em>\n\n[html](#a-guide)\n\n# `<em>guide</em>`\n\n[code](#emguideem)\n");
  assert.equal(valid.status, 0, valid.stderr);

  const broken = verify("# `<em>guide</em>`\n\n[wrong](#guide)\n");
  assert.notEqual(broken.status, 0, "an anchor derived by stripping inline-code text must fail");
  assert.match(broken.stderr, /Missing heading: docs\/fixture\.md:3: #guide/);
});
