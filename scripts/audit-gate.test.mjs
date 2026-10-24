// Tests for scripts/audit-gate.mjs.
// Run: node --test scripts/audit-gate.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAudit, parseRegister } from './audit-gate.mjs';

const HEADER = [
  '| Package | Advisory ID | Rationale | Review date |',
  '| --- | --- | --- | --- |',
].join('\n');

test('parseRegister reads rows from the register table', () => {
  const markdown = [
    '# Audit exceptions',
    '',
    'Some prose that mentions | pipes | but is not a table row.',
    '',
    HEADER,
    '| `zod` | `GHSA-mrhx-c7xc-m3w5` | Parse path unused. | 2026-11-23 |',
    '| glob | deprecation | Azure preset only. | 2026-11-23 |',
    '',
    'Trailing prose.',
  ].join('\n');

  assert.deepEqual(parseRegister(markdown), [
    {
      package: 'zod',
      advisoryId: 'GHSA-mrhx-c7xc-m3w5',
      rationale: 'Parse path unused.',
      reviewDate: '2026-11-23',
    },
    {
      package: 'glob',
      advisoryId: 'deprecation',
      rationale: 'Azure preset only.',
      reviewDate: '2026-11-23',
    },
  ]);
});

test('parseRegister rejects a missing table or a malformed row', () => {
  const row = (cells) => `${HEADER}\n| ${cells.join(' | ')} |`;
  const cases = [
    ['no table at all', '# Audit exceptions\n\nNothing here.', /header/i],
    ['too few cells', row(['zod', 'GHSA-a', '2026-11-23']), /4 cells/],
    ['empty cell', row(['zod', '', 'why', '2026-11-23']), /empty/i],
    ['bad date format', row(['zod', 'GHSA-a', 'why', '23/11/2026']), /date/i],
    ['impossible date', row(['zod', 'GHSA-a', 'why', '2026-02-30']), /date/i],
  ];
  for (const [name, markdown, message] of cases) {
    assert.throws(() => parseRegister(markdown), message, name);
  }
});

/**
 * Builds a record shaped like `yarn npm audit --all --recursive --json`.
 * @param {string} pkg The package name.
 * @param {number|string} id The audit ID.
 * @param {string} severity The reported severity.
 * @param {object} extra Fields that override the defaults.
 * @returns {object} The audit record.
 */
const finding = (pkg, id, severity, extra = {}) => ({
  value: pkg,
  children: {
    ID: id,
    Issue: `${pkg} issue`,
    URL: `https://github.com/advisories/GHSA-${id}`,
    Severity: severity,
    'Vulnerable Versions': '<9.9.9',
    'Tree Versions': ['1.0.0'],
    Dependents: ['parent@npm:1.0.0'],
    ...extra,
  },
});
const TODAY = '2026-10-24';

test('evaluateAudit fails critical and high, warns on the rest', () => {
  const reports = [
    finding('crit-pkg', 1, 'critical'),
    finding('high-pkg', 2, 'high'),
    finding('mod-pkg', 3, 'moderate'),
    finding('low-pkg', 4, 'low'),
  ];

  const result = evaluateAudit({ reports, exceptions: [], today: TODAY });

  assert.equal(result.failures.length, 2);
  assert.match(result.failures[0], /crit-pkg/);
  assert.match(result.failures[1], /high-pkg/);
  assert.equal(result.warnings.length, 2);
  assert.match(result.warnings[0], /mod-pkg/);
  assert.match(result.warnings[1], /low-pkg/);
});

/** Builds a parsed register entry (review date defaults to 2026-11-23). */
const entry = (pkg, advisoryId, reviewDate = '2026-11-23') => ({
  package: pkg,
  advisoryId,
  rationale: 'Documented.',
  reviewDate,
});

test('evaluateAudit passes a high finding that has a register entry', () => {
  const reports = [finding('zod', 1243066, 'high', {
    URL: 'https://github.com/advisories/GHSA-mrhx-c7xc-m3w5',
  })];

  for (const advisoryId of ['GHSA-mrhx-c7xc-m3w5', '1243066']) {
    const result = evaluateAudit({
      reports,
      exceptions: [entry('zod', advisoryId)],
      today: TODAY,
    });
    assert.deepEqual(result.failures, [], advisoryId);
    assert.equal(result.excepted.length, 1, advisoryId);
    assert.match(result.excepted[0], /zod/);
  }
});

test('evaluateAudit ignores entries for another advisory or package', () => {
  const reports = [finding('zod', 1243066, 'high')];

  const others = [entry('zod', 'GHSA-other'), entry('not-zod', '1243066')];
  for (const other of others) {
    const result = evaluateAudit({
      reports,
      exceptions: [other],
      today: TODAY,
    });
    assert.equal(result.failures.length, 1);
    assert.deepEqual(result.excepted, []);
  }
});

test('evaluateAudit fails once an entry is past its review date', () => {
  const reports = [finding('zod', 1243066, 'high')];

  // The day after the review date fails, even though the finding is covered.
  const late = evaluateAudit({
    reports,
    exceptions: [entry('zod', '1243066', '2026-10-23')],
    today: TODAY,
  });
  assert.equal(late.failures.length, 1);
  assert.match(late.failures[0], /zod.*review.*2026-10-23/i);

  // An expired entry fails even when the finding it covered is gone.
  const stale = evaluateAudit({
    reports: [],
    exceptions: [entry('zod', '1243066', '2026-10-23')],
    today: TODAY,
  });
  assert.equal(stale.failures.length, 1);

  // The review date itself is still within the exception.
  const onTheDay = evaluateAudit({
    reports,
    exceptions: [entry('zod', '1243066', TODAY)],
    today: TODAY,
  });
  assert.deepEqual(onTheDay.failures, []);
});

test('evaluateAudit fails closed on a severity it does not know', () => {
  const result = evaluateAudit({
    reports: [finding('odd-pkg', 7, 'catastrophic')],
    exceptions: [],
    today: TODAY,
  });
  assert.equal(result.failures.length, 1);
});

test('evaluateAudit matches deprecation notices by "deprecation"', () => {
  const reports = [finding('glob', 'glob (deprecation)', 'high', {
    URL: undefined,
  })];
  const result = evaluateAudit({
    reports,
    exceptions: [entry('glob', 'deprecation')],
    today: TODAY,
  });
  assert.deepEqual(result.failures, []);
  assert.equal(result.excepted.length, 1);
});
