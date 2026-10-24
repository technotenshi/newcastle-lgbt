#!/usr/bin/env node
// Dependency audit gate: runs a recursive Yarn audit and fails on critical or
// high findings that have no entry in the exception register. Moderate, low
// and info findings (including deprecation notices) are logged as warnings.
// A register entry past its review date also fails.
//
// Usage: node scripts/audit-gate.mjs [--input <saved-audit-output>]
// Run from the repository root. Exit code 0 = gate passes, 1 = gate fails or
// the audit could not run. Rules and the register:
// docs/maintenance/audit-exceptions.md. This is plain Node on purpose, so CI
// can run it without the Nuxt toolchain.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {object} AuditRecord One line of `yarn npm audit --json` output.
 * @property {string} value The package name.
 * @property {object} children The report: ID, Issue, URL, Severity,
 *   'Vulnerable Versions', 'Tree Versions' and Dependents.
 */

const REGISTER_HEADER = ['package', 'advisory id', 'rationale', 'review date'];

/**
 * Splits a markdown table row into trimmed cells.
 * @param {string} line A line starting with "|".
 * @returns {string[]} The cell texts.
 */
function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

/**
 * Checks for a real calendar date written as YYYY-MM-DD.
 * @param {string} text The candidate date.
 * @returns {boolean} True when the text is a valid date.
 */
function isIsoDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }
  // Round-trip catches impossible dates such as 2026-02-30.
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === text;
}

/**
 * Parses the exception register: the markdown table whose header is
 * Package | Advisory ID | Rationale | Review date. Other text is ignored.
 * @param {string} markdown The register file contents.
 * @returns {{package: string, advisoryId: string, rationale: string,
 *   reviewDate: string}[]} One entry per table row.
 */
export function parseRegister(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex(
    (line) =>
      line.trim().startsWith('|') &&
      splitRow(line).join('|').toLowerCase() === REGISTER_HEADER.join('|'),
  );
  if (start === -1) {
    throw new Error(
      'Register table not found. Expected the header: ' +
        '| Package | Advisory ID | Rationale | Review date |',
    );
  }
  const entries = [];
  // Skip the header and its "| --- |" separator row.
  for (let i = start + 2; i < lines.length; i += 1) {
    if (!lines[i].trim().startsWith('|')) {
      break;
    }
    const where = `Register line ${i + 1}`;
    const cells = splitRow(lines[i]).map((cell) => cell.replace(/`/g, ''));
    if (cells.length !== REGISTER_HEADER.length) {
      throw new Error(
        `${where}: expected ${REGISTER_HEADER.length} cells, ` +
          `found ${cells.length}.`,
      );
    }
    if (cells.some((cell) => cell === '')) {
      throw new Error(`${where}: a cell is empty.`);
    }
    if (!isIsoDate(cells[3])) {
      throw new Error(
        `${where}: review date "${cells[3]}" is not a valid YYYY-MM-DD date.`,
      );
    }
    entries.push({
      package: cells[0],
      advisoryId: cells[1],
      rationale: cells[2],
      reviewDate: cells[3],
    });
  }
  return entries;
}

/** Severities that are shown in the log but never fail the gate. */
const WARN_ONLY = new Set(['info', 'low', 'moderate']);

/**
 * Describes one audit record on a single log line.
 * @param {AuditRecord} record One audit record.
 * @returns {string} The package, versions, severity, ID and issue text.
 */
function describe(record) {
  const report = record.children;
  const versions = (report['Tree Versions'] ?? []).join(', ');
  return `${record.value}@${versions} ${report.Severity} ` +
    `[${report.ID}]: ${report.Issue}`;
}

/**
 * Finds the register entry that covers an audit record, if any. An entry
 * matches on package plus advisory: the numeric audit ID, the GHSA ID from the
 * advisory URL, or the word "deprecation" for npm deprecation notices (their
 * audit ID is text, not a number).
 * @param {AuditRecord} record One audit record.
 * @param {object[]} exceptions Parsed register entries.
 * @returns {object|undefined} The matching entry.
 */
function findException(record, exceptions) {
  const report = record.children;
  const ids = [String(report.ID)];
  const ghsa = /GHSA-[\w-]+/i.exec(report.URL ?? '');
  if (ghsa) {
    ids.push(ghsa[0]);
  }
  if (typeof report.ID === 'string' && report.ID.endsWith('(deprecation)')) {
    ids.push('deprecation');
  }
  return exceptions.find(
    (entry) =>
      entry.package === record.value &&
      ids.some((id) => id.toLowerCase() === entry.advisoryId.toLowerCase()),
  );
}

/**
 * Applies the gate to audit records.
 * @param {{reports: AuditRecord[], exceptions: object[], today: string}}
 *   input Audit records, parsed register entries, and today's date as
 *   YYYY-MM-DD.
 * @returns {{failures: string[], warnings: string[], excepted: string[]}}
 *   Messages that fail the job, messages shown without failing it, and
 *   blocking findings covered by a register entry. Critical, high and any
 *   unrecognised severity are blocking.
 */
export function evaluateAudit({ reports, exceptions, today }) {
  const failures = [];
  const warnings = [];
  const excepted = [];
  for (const record of reports) {
    const text = describe(record);
    if (WARN_ONLY.has(record.children.Severity)) {
      warnings.push(text);
    } else if (findException(record, exceptions)) {
      excepted.push(text);
    } else {
      failures.push(text);
    }
  }
  // A register entry is a temporary exception, so it fails once it is due
  // for review, whether or not its finding is still reported. ISO dates
  // compare correctly as strings.
  for (const entry of exceptions) {
    if (today > entry.reviewDate) {
      failures.push(
        `Register entry ${entry.package} [${entry.advisoryId}] was due for ` +
          `review on ${entry.reviewDate}. Re-check it, then extend the date ` +
          'or remove ' +
          'the entry.',
      );
    }
  }
  return { failures, warnings, excepted };
}

const REGISTER_FILE = new URL(
  '../docs/maintenance/audit-exceptions.md',
  import.meta.url,
);
const AUDIT_ARGS = ['npm', 'audit', '--all', '--recursive', '--json'];

/**
 * Parses `yarn npm audit --json` output: one JSON object per line.
 * @param {string} text The raw audit output.
 * @returns {AuditRecord[]} The audit records.
 */
function parseAuditOutput(text) {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line, index) => {
      let record;
      try {
        record = JSON.parse(line);
      } catch {
        throw new Error(`Audit output line ${index + 1} is not JSON.`);
      }
      if (typeof record?.value !== 'string' || !record.children?.Severity) {
        throw new Error(`Audit output line ${index + 1} has an unknown shape.`);
      }
      return record;
    });
}

/**
 * Gets audit records from a saved file or by running Yarn.
 * @param {string|undefined} inputFile Saved audit output, if given.
 * @returns {AuditRecord[]} The audit records.
 */
function loadReports(inputFile) {
  if (inputFile) {
    return parseAuditOutput(readFileSync(inputFile, 'utf8'));
  }
  const run = spawnSync('yarn', AUDIT_ARGS, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (run.error) {
    throw new Error(`Could not run yarn: ${run.error.message}`);
  }
  const reports = parseAuditOutput(run.stdout);
  // Yarn exits 1 when it reports findings, so only an exit with no findings
  // at all means the audit itself broke (for example, the registry is down).
  if (run.status !== 0 && reports.length === 0) {
    throw new Error(
      `yarn npm audit failed (exit ${run.status}): ${run.stderr.trim()}`,
    );
  }
  return reports;
}

/**
 * Prints a message, plus a GitHub Actions annotation when running in CI.
 * @param {'error'|'warning'|'notice'} level The annotation level.
 * @param {string} label The plain-text log prefix.
 * @param {string} message The one-line message.
 */
function log(level, label, message) {
  console.log(`${label} ${message}`);
  if (process.env.GITHUB_ACTIONS === 'true') {
    const escaped = message.replace(/%/g, '%25');
    console.log(`::${level} title=Dependency audit::${escaped}`);
  }
}

/**
 * Runs the gate and prints the result.
 * @returns {number} The process exit code.
 */
function main() {
  const flag = process.argv.indexOf('--input');
  const inputFile = flag === -1 ? undefined : process.argv[flag + 1];
  const today = new Date().toISOString().slice(0, 10);
  const exceptions = parseRegister(
    readFileSync(fileURLToPath(REGISTER_FILE), 'utf8'),
  );
  const reports = loadReports(inputFile);
  const result = evaluateAudit({ reports, exceptions, today });

  console.log(
    `Audit gate (${today}): ${reports.length} reports, ` +
      `${result.failures.length} failing, ` +
      `${result.excepted.length} excepted, ` +
      `${result.warnings.length} warnings.`,
  );
  result.warnings.forEach((m) => log('warning', 'WARN    ', m));
  result.excepted.forEach((m) => log('notice', 'EXCEPTED', m));
  result.failures.forEach((m) => log('error', 'FAIL    ', m));
  return result.failures.length > 0 ? 1 : 0;
}

// Run only when executed directly, not when the tests import this module.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`FAIL     ${error.message}`);
    process.exitCode = 1;
  }
}
