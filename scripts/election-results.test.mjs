import assert from 'node:assert/strict';
import test from 'node:test';
import { formatElectionResults } from '../utils/election-results.mjs';

test('seat summaries use chamber counts, not votes or race leads', () => {
  const result = formatElectionResults({ id: 'house', title: 'House', type: 'seats', unit: 'seats', total: 98,
    source: 'Official returns', snapshot: '2026-11-04T17:52:00-08:00', status: { kind: 'scenario' },
    results: [{ id: 'd', label: 'Democratic', party: 'Democratic', seats: 68, before: 59 },
      { id: 'r', label: 'Republican', party: 'Republican', seats: 30, before: 39 }] });
  assert.deepEqual(result.results.map(row => row.percent), ['69.39', '30.61']);
  assert.equal(result.results[0].change, '+9');
  assert.equal(result.lead, null);
  assert.match(result.statusText, /If current leads hold/);
});

test('accounting names its actual source, not an assumed news organization', () => {
  const result = formatElectionResults({ id: 'house', title: 'House', type: 'seats', unit: 'seats', total: 100,
    source: 'Election commission', snapshot: '2026-11-04T18:05:00-08:00', status: { kind: 'accounting' },
    results: [{ id: 'd', label: 'Democratic', party: 'Democratic', seats: 54 },
      { id: 'r', label: 'Republican', party: 'Republican', seats: 44 },
      { id: 'u', label: 'Uncalled', uncalled: true, seats: 2 }] });
  assert.match(result.statusText, /^Election commission accounting:/);
  assert.doesNotMatch(result.statusText, /\bAP\b/);
});

test('measures preserve official Approved and Rejected responses', () => {
  const input = measure();
  input.results = [{ id: 'approved', label: 'Approved', votes: 90716, stance: 'neutral' },
    { id: 'rejected', label: 'Rejected', votes: 187095, stance: 'neutral' }];
  assert.deepEqual(formatElectionResults(input).results.map(row => [row.label, row.percent]), [['Approved', '32.65'], ['Rejected', '67.35']]);
  input.results.reverse();
  assert.deepEqual(formatElectionResults(input).results.map(row => row.label), ['Rejected', 'Approved']);
});

test('a call can be verified by a cutoff without inventing its call time', () => {
  const result = formatElectionResults({ ...measure(), status: { kind: 'called', resultId: 'yes', source: 'AP', observedAt: '2026-11-04T18:05:00-08:00' } });
  assert.equal(result.statusTimeLabel, 'Call verified as of');
  assert.equal(result.statusTime, 'Nov 4, 2026, 6:05 PM PST');
});

test('a sourced call can omit an unconfirmed absolute time without weakening certification', () => {
  const input = { ...measure(), status: { kind: 'called', resultId: 'yes', source: 'AP via The Seattle Times' } };
  const result = formatElectionResults(input);
  assert.equal(result.statusText, 'Attributed call: Yes. Uncertified.');
  assert.equal(result.status.source, 'AP via The Seattle Times');
  assert.equal(result.statusTime, null);
  assert.equal(result.snapshotTime, 'Nov 4, 2026, 5:52 PM PST');
  input.status.kind = 'certified';
  assert.throws(() => formatElectionResults(input), /status.at.*timestamp/);
});

const measure = (yes = 1252863, no = 961810) => ({
  id: 'IL26-638', title: 'Restrict girls’ school sports participation', type: 'measure',
  source: 'Washington Secretary of State official media export',
  snapshot: '2026-11-04T17:52:00-08:00', status: { kind: 'leading' },
  results: [
    { id: 'yes', label: 'Yes', votes: yes, stance: 'harmful' },
    { id: 'no', label: 'No', votes: no, stance: 'favorable' },
  ],
});

test('official initiative counts produce precise shares and a current lead, never a call', () => {
  const result = formatElectionResults(measure());
  assert.equal(result.total, 2214673);
  assert.deepEqual(result.results.map(row => [row.label, row.count, row.percent]), [
    ['Yes', '1,252,863', '56.57'], ['No', '961,810', '43.43'],
  ]);
  assert.equal(result.lead, 'Current leader: Yes by 291,053 votes (13.14 percentage points).');
  assert.equal(result.statusText, 'Leading only; uncertified.');
});

test('other article measures retain Yes then No and their literal official shares', () => {
  for (const [yes, no, shares, lead] of [
    [1027479, 1141234, ['47.38', '52.62'], '113,755'],
    [936309, 1289553, ['42.07', '57.93'], '353,244'],
  ]) {
    const result = formatElectionResults(measure(yes, no));
    assert.deepEqual(result.results.map(row => row.percent), shares);
    assert.deepEqual(result.results.map(row => row.id), ['yes', 'no']);
    assert.match(result.lead, new RegExp(`No by ${lead} votes`));
  }
});

test('candidate ballot order survives ranking; all parties and supplied write-ins count', () => {
  const result = formatElectionResults({
    ...measure(), type: 'candidate',
    results: [
      { id: 'a', label: 'Candidate A', party: 'Republican', votes: 200 },
      { id: 'b', label: 'Candidate B', party: 'Democratic', votes: 400 },
      { id: 'c', label: 'Candidate C', party: 'Libertarian', votes: 150 },
      { id: 'd', label: 'Candidate D', party: 'Green', votes: 100 },
      { id: 'e', label: 'Candidate E', party: 'Independent', votes: 50 },
      { id: 'f', label: 'Candidate F', party: 'Local party', votes: 50 },
      { id: 'write-ins', label: 'Write-ins', party: 'Nonpartisan', votes: 50 },
    ],
  });
  assert.equal(result.total, 1000);
  assert.deepEqual(result.results.map(row => row.percent), ['20.00', '40.00', '15.00', '10.00', '5.00', '5.00', '5.00']);
  assert.deepEqual(result.results.map(row => row.tone), ['red', 'blue', 'gold', 'green', 'gray', 'gray', 'gray']);
  assert.equal(result.results[5].party, 'Local party');
  assert.equal(result.lead, 'Current leader: Candidate B by 200 votes (20.00 percentage points).');
});

test('zero, tied and explicitly incomplete snapshots state their limits', () => {
  const zero = formatElectionResults(measure(0, 0));
  assert.equal(zero.lead, 'No votes reported.');
  assert.deepEqual(zero.results.map(row => row.percent), [null, null]);
  assert.equal(formatElectionResults(measure(5, 5)).lead, 'Tied: Yes, No with 5 votes each.');
  const partial = formatElectionResults({ ...measure(), incomplete: true, incompleteNote: 'Write-ins not supplied.' });
  assert.equal(partial.completeness, 'Incomplete data: Write-ins not supplied. Percentages and lead use supplied votes only.');
  assert.equal(formatElectionResults(measure()).completeness, 'Percentages include all supplied responses.');
});

test('calls and certification carry separate attributable evidence and Pacific timestamps', () => {
  const called = formatElectionResults({ ...measure(), status: {
    kind: 'called', resultId: 'yes', source: 'AP supplied screenshot; original URL not supplied',
    at: '2026-11-04T18:14:00-08:00',
  } });
  assert.equal(called.statusText, 'Attributed call: Yes. Uncertified.');
  assert.equal(called.status.source, 'AP supplied screenshot; original URL not supplied');
  assert.equal(called.statusTime, 'Nov 4, 2026, 6:14 PM PST');
  assert.equal(called.snapshotTime, 'Nov 4, 2026, 5:52 PM PST');
  const certified = formatElectionResults({ ...measure(), status: {
    kind: 'certified', resultId: 'yes', source: 'Election authority', at: '2026-11-24T12:00:00-08:00',
  } });
  assert.equal(certified.statusText, 'Certified result: Yes.');
});

test('invalid author input fails with a contest-specific explanation', () => {
  const invalid = [
    [c => c.results[0].votes = -1, /votes.*non-negative safe integer/],
    [c => c.results[0].votes = '1252863', /votes.*non-negative safe integer/],
    [c => c.results[0].votes = 1.5, /votes.*non-negative safe integer/],
    [c => c.results[0].votes = NaN, /votes.*non-negative safe integer/],
    [c => c.results[0].votes = Infinity, /votes.*non-negative safe integer/],
    [c => c.results[0].votes = Number.MAX_SAFE_INTEGER + 1, /votes.*non-negative safe integer/],
    [c => c.results[0].votes = Number.MAX_SAFE_INTEGER, /total.*safe integer/],
    [c => c.results[1].id = 'yes', /duplicate result id/],
    [c => c.results[0].stance = 'good', /stance/],
    [c => delete c.results[0].stance, /stance/],
    [c => c.results[0].id = 'wrong', /Yes then No/],
    [c => c.results[0].label = 'Approved', /Yes then No/],
    [c => c.results = [], /at least two/],
    [c => c.results[0] = null, /result.*object/],
    [c => c.title = '', /title/],
    [c => c.type = 'race', /type/],
    [c => c.source = '', /source/],
    [c => c.snapshot = '2026-11-04', /snapshot.*timestamp/],
    [c => c.snapshot = '2026-02-30T17:52:00-08:00', /snapshot.*timestamp/],
    [c => c.snapshot = '2026-11-04T25:52:00-08:00', /snapshot.*timestamp/],
    [c => c.status = { kind: 'winner' }, /status.kind/],
    [c => c.status.source = 'AP', /leading.*evidence/],
    [c => c.status = { kind: 'called', resultId: 'yes' }, /status.source/],
    [c => c.status = { kind: 'called', resultId: 'unknown', source: 'AP', at: c.snapshot }, /resultId/],
    [c => c.status = { kind: 'certified', resultId: 'no', source: 'Authority', at: c.snapshot }, /certified.*leader/],
    [c => c.status = { kind: 'called', resultId: 'yes', source: 'AP', at: 'yesterday' }, /status.at.*timestamp/],
    [c => c.status.certified = true, /unknown.*status.*certified/],
    [c => c.incomplete = 'true', /incomplete.*boolean/],
    [c => c.incomplete = true, /incompleteNote/],
    [c => c.incompleteNote = 'Omitted rows', /incompleteNote.*incomplete/],
    [c => c.results[0].percent = 56.57, /unknown.*percent/],
  ];
  for (const [change, message] of invalid) {
    const input = measure();
    change(input);
    assert.throws(() => formatElectionResults(input), error => {
      assert.match(error.message, /ElectionResults \[IL26-638\]/);
      assert.match(error.message, message);
      return true;
    });
  }
  assert.throws(() => formatElectionResults(null), /contest.*object/);
});

test('invalid seat summaries and ambiguous call times are rejected', () => {
  const base = { id: 'summary', title: 'Summary', type: 'seats', unit: 'seats', total: 100,
    source: 'AP', snapshot: '2026-11-04T18:05:00-08:00', status: { kind: 'accounting' },
    results: [{ id: 'd', label: 'Democratic', party: 'Democratic', seats: 54 },
      { id: 'r', label: 'Republican', party: 'Republican', seats: 44 },
      { id: 'u', label: 'Uncalled', uncalled: true, seats: 2 }] };
  for (const [change, message] of [
    [c => c.results[0].seats = -1, /seats.*non-negative/],
    [c => c.results[0].seats = 53, /sum to total/],
    [c => c.results[2].party = 'Democratic', /uncalled.*party/],
    [c => c.results[2].uncalled = false, /party/],
    [c => c.results[1].id = 'd', /duplicate/],
    [c => c.results[0].before = 50, /before counts/],
    [c => c.results[0].before = 101, /before.*sensible/],
    [c => c.unit = 'votes', /unit/],
    [c => c.status = { kind: 'called', resultId: 'd', source: 'AP', at: c.snapshot }, /seat status/],
  ]) {
    const input = structuredClone(base);
    change(input);
    assert.throws(() => formatElectionResults(input), message);
  }
  const input = measure();
  input.status = { kind: 'called', resultId: 'yes', source: 'AP', at: input.snapshot, observedAt: input.snapshot };
  assert.throws(() => formatElectionResults(input), /observedAt/);
  input.status = { kind: 'certified', resultId: 'yes', source: 'Authority', observedAt: input.snapshot };
  assert.throws(() => formatElectionResults(input), /observedAt/);
});

test('certification cannot contradict tied, zero or incomplete count data', () => {
  for (const data of [measure(0, 0), measure(5, 5), { ...measure(), incomplete: true, incompleteNote: 'Missing rows.' }]) {
    assert.throws(() => formatElectionResults({ ...data, status: {
      kind: 'certified', resultId: 'yes', source: 'Authority', at: '2026-11-24T12:00:00-08:00',
    } }), /certified result must be the sole leader in a complete, nonzero count/);
  }
});
