import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
// Reuse the Markdown stack already resolved by the installed Nuxt MDC toolchain.
import { unified } from "unified";
import remarkParse from "remark-parse";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
const errors = [];
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

// Stay below Hermes's supported 20k-character floor, with room for growth.
check(agents.length <= 12000, `AGENTS.md has ${agents.length} characters; budget is 12000`);
check(agents.trimEnd().split("\n").length <= 180, "AGENTS.md exceeds the 180-line budget");
check(!existsSync(join(root, "CLAUDE.md")), "Keep AGENTS.md canonical; CLAUDE.md must not shadow it");

const documents = ["AGENTS.md", "README.md", "GLOSSARY.md"];
function collect(directory) {
  for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (entry.name.endsWith(".md")) documents.push(path);
  }
}
collect("docs");
collect(".agents");
collect(".github/skills");

const parser = unified().use(remarkParse);
const parsed = new Map();
function markdown(file) {
  if (parsed.has(file)) return parsed.get(file);
  const tree = parser.parse(readFileSync(file, "utf8"));
  const slugger = new GithubSlugger();
  const ids = new Set();
  const definitions = new Map();
  const links = [];
  const references = [];
  function visit(node) {
    if (node.type === "heading") ids.add(slugger.slug(toString(node, { includeHtml: false })));
    if (node.type === "definition") definitions.set(node.identifier, node.url);
    if (node.type === "link" || node.type === "image") links.push({ url: node.url, line: node.position.start.line });
    if (node.type === "linkReference" || node.type === "imageReference") references.push(node);
    for (const child of node.children || []) visit(child);
  }
  visit(tree);
  for (const node of references) {
    const url = definitions.get(node.identifier);
    if (url !== undefined) links.push({ url, line: node.position.start.line });
  }
  const result = { ids, links };
  parsed.set(file, result);
  return result;
}

for (const document of documents) {
  for (const { url: target, line } of markdown(join(root, document)).links) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(target)) continue;
    const separator = target.indexOf("#");
    const path = separator < 0 ? target : target.slice(0, separator);
    const fragment = separator < 0 ? "" : target.slice(separator + 1);
    const label = `${document}:${line}: ${target}`;
    let file;
    let anchor;
    try {
      file = path ? resolve(root, dirname(document), decodeURIComponent(path)) : join(root, document);
      anchor = decodeURIComponent(fragment);
    } catch {
      check(false, `Invalid URL encoding: ${label}`);
      continue;
    }
    check(existsSync(file), `Missing link target: ${label}`);
    if (anchor && existsSync(file) && file.endsWith(".md")) {
      check(markdown(file).ids.has(anchor), `Missing heading: ${label}`);
    }
  }
}

const settings = JSON.parse(readFileSync(join(root, ".claude/settings.json"), "utf8"));
check(!settings.hooks, "Repository Claude hooks were retired; use native permissions and explicit checks");
for (const rule of ["Read(/**/.env)", "Read(/**/.env.*)", "Edit(/**/.env)", "Edit(/**/.env.*)", "Edit(/**/yarn.lock)"]) {
  check(settings.permissions?.deny?.includes(rule), `Missing native protection: ${rule}`);
}

for (const error of errors) console.error(`FAIL: ${error}`);
assert.equal(errors.length, 0, `${errors.length} agent-documentation check(s) failed`);
console.log(`OK: ${documents.length} Markdown documents checked; AGENTS.md ${agents.length} characters; native file protections present.`);
