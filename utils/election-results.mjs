const counts = new Intl.NumberFormat('en-US');
const pacificTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles', year: 'numeric', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
});
const partyTones = new Map([
  ['democratic', 'blue'], ['democrat', 'blue'], ['republican', 'red'],
  ['libertarian', 'gold'], ['green', 'green'],
]);

function validateContest(contest) {
  const fail = message => { throw new Error(`ElectionResults [${contest?.id || 'unknown'}]: ${message}`); };
  const object = (value, field) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${field} must be an object`);
  };
  const text = (value, field) => {
    if (typeof value !== 'string' || !value.trim()) fail(`${field} must be non-empty text`);
  };
  const keys = (value, allowed, field) => {
    for (const key of Object.keys(value)) {
      if (!allowed.includes(key)) fail(`unknown ${field} field: ${key}`);
    }
  };
  const timestamp = (value, field) => {
    const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|[+-]\d{2}:\d{2})$/.exec(value);
    if (!match) fail(`${field} must be an ISO timestamp with seconds and timezone`);
    const [, year, month, day, hour, minute, second, zone] = match;
    const days = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
    if (Number(year) < 1000 || Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > days
      || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59
      || (zone !== 'Z' && (Number(zone.slice(1, 3)) > 14 || Number(zone.slice(4)) > 59
        || (Number(zone.slice(1, 3)) === 14 && Number(zone.slice(4)) !== 0)))
      || !Number.isFinite(Date.parse(value))) fail(`${field} is an invalid timestamp`);
  };
  object(contest, 'contest');
  keys(contest, ['id', 'title', 'type', 'source', 'snapshot', 'status', 'results', 'incomplete', 'incompleteNote', 'unit', 'total'], 'contest');
  for (const field of ['id', 'title', 'source']) text(contest[field], field);
  if (!['measure', 'candidate', 'seats'].includes(contest.type)) fail('type must be measure, candidate or seats');
  if (contest.type === 'seats') {
    if (!['seats', 'governorships'].includes(contest.unit)) fail('unit must be seats or governorships');
    if (!Number.isSafeInteger(contest.total) || contest.total <= 0) fail('total must be a positive safe integer');
    if (contest.incomplete !== undefined || contest.incompleteNote !== undefined) fail('seat summaries must include the whole total');
  } else if (contest.unit !== undefined || contest.total !== undefined) fail('unit and total are only for seats');
  timestamp(contest.snapshot, 'snapshot');
  if (contest.incomplete !== undefined && typeof contest.incomplete !== 'boolean') fail('incomplete must be a boolean');
  if (contest.incomplete) text(contest.incompleteNote, 'incompleteNote');
  else if (contest.incompleteNote !== undefined) fail('incompleteNote requires incomplete: true');
  if (!Array.isArray(contest.results) || contest.results.length < 2) fail('results needs at least two entries');
  const ids = new Set();
  let total = 0;
  for (const row of contest.results) {
    object(row, 'result');
    keys(row, contest.type === 'seats' ? ['id', 'label', 'seats', 'party', 'before', 'uncalled']
      : ['id', 'label', 'votes', contest.type === 'measure' ? 'stance' : 'party'], 'result');
    text(row.id, 'result.id');
    text(row.label, 'result.label');
    if (ids.has(row.id)) fail(`duplicate result id: ${row.id}`);
    ids.add(row.id);
    const field = contest.type === 'seats' ? 'seats' : 'votes';
    if (!Number.isSafeInteger(row[field]) || row[field] < 0) fail(`result ${row.id} ${field} must be a non-negative safe integer`);
    total += row[field];
    if (!Number.isSafeInteger(total)) fail('total must be a safe integer');
    if (contest.type === 'measure') {
      if (!['favorable', 'harmful', 'neutral'].includes(row.stance)) fail(`result ${row.id} stance must be favorable, harmful or neutral`);
    } else if (contest.type === 'seats' && row.uncalled === true) {
      if (row.party !== undefined || row.before !== undefined) fail('uncalled must not have a party or before count');
    } else {
      text(row.party, `result ${row.id} party`);
      if (row.uncalled !== undefined) fail('uncalled must be true or omitted');
      if (row.before !== undefined && (!Number.isSafeInteger(row.before) || row.before < 0 || row.before > contest.total)) fail('before must be a sensible non-negative safe integer');
    }
  }
  if (contest.type === 'seats') {
    if (total !== contest.total) fail('seat rows must sum to total including uncalled');
    const before = contest.results.filter(row => row.before !== undefined);
    if (before.length && (before.length !== contest.results.length || before.reduce((sum, row) => sum + row.before, 0) !== contest.total)) fail('before counts must cover the whole total');
  }
  if (contest.type === 'measure' && (contest.results.length !== 2
    || ![['yes', 'Yes', 'no', 'No'], ['approved', 'Approved', 'rejected', 'Rejected']].some(
      ([a, aLabel, b, bLabel]) => contest.results.some(row => row.id === a && row.label === aLabel)
        && contest.results.some(row => row.id === b && row.label === bLabel),
    ))) fail('measures require Yes then No or Approved then Rejected labels with matching ids');
  object(contest.status, 'status');
  keys(contest.status, ['kind', 'resultId', 'source', 'at', 'observedAt'], 'status');
  if (contest.type === 'seats') {
    if (!['scenario', 'accounting'].includes(contest.status.kind) || Object.keys(contest.status).length !== 1) fail('seat status must be scenario or accounting without call evidence');
    return;
  }
  if (!['leading', 'called', 'certified'].includes(contest.status.kind)) fail('status.kind must be leading, called or certified');
  if (contest.status.kind === 'leading') {
    if (Object.keys(contest.status).length !== 1) fail('leading status must not include call or certification evidence');
  } else {
    if (!ids.has(contest.status.resultId)) fail('status.resultId must match a supplied result id');
    text(contest.status.source, 'status.source');
    if (contest.status.kind === 'called' && contest.status.observedAt !== undefined && contest.status.at === undefined) {
      timestamp(contest.status.observedAt, 'status.observedAt');
    } else {
      if (contest.status.observedAt !== undefined) fail('observedAt is only for a call without an exact at time');
      timestamp(contest.status.at, 'status.at');
    }
    if (contest.status.kind === 'certified') {
      const selected = contest.results.find(row => row.id === contest.status.resultId);
      if (!total || contest.incomplete || contest.results.some(row => row !== selected && row.votes >= selected.votes)) {
        fail('certified result must be the sole leader in a complete, nonzero count');
      }
    }
  }
}

/** Format an authored election snapshot without inferring an election outcome. */
export function formatElectionResults(contest) {
  validateContest(contest);
  if (contest.type === 'seats') {
    return {
      ...contest,
      results: contest.results.map(row => ({ ...row, count: counts.format(row.seats),
        percent: (row.seats / contest.total * 100).toFixed(2),
        tone: row.uncalled ? 'gray' : (partyTones.get(row.party.toLowerCase().trim()) || 'gray'),
        change: row.before === undefined ? null : `${row.seats - row.before > 0 ? '+' : ''}${row.seats - row.before}` })),
      lead: null,
      statusText: contest.status.kind === 'scenario' ? 'If current leads hold; not called or certified.'
        : `${contest.source} accounting: called seats and continuing officeholders; uncalled shown separately. Not certified.`,
      snapshotTime: pacificTime.format(new Date(contest.snapshot)),
      statusTime: null,
      completeness: `Shares of all ${counts.format(contest.total)} ${contest.unit}, including uncalled where applicable.`,
    };
  }
  const total = contest.results.reduce((sum, row) => sum + row.votes, 0);
  const ranked = [...contest.results].sort((a, b) => b.votes - a.votes);
  const margin = ranked[0].votes - ranked[1].votes;
  const tied = ranked.filter(row => row.votes === ranked[0].votes);
  const outcome = contest.results.find(row => row.id === contest.status.resultId);
  const statusText = contest.status.kind === 'leading' ? 'Leading only; uncertified.'
    : contest.status.kind === 'called' ? `Attributed call: ${outcome.label}. Uncertified.`
      : `Certified result: ${outcome.label}.`;
  return {
    ...contest,
    total,
    results: contest.results.map(row => ({
      ...row, count: counts.format(row.votes), percent: total ? (row.votes / total * 100).toFixed(2) : null,
      tone: contest.type === 'candidate' ? (partyTones.get(row.party.toLowerCase().trim()) || 'gray')
        : ({ favorable: 'green', harmful: 'red', neutral: 'gray' })[row.stance],
    })),
    lead: !total ? 'No votes reported.' : !margin
      ? `Tied: ${tied.map(row => row.label).join(', ')} with ${counts.format(ranked[0].votes)} votes each.`
      : `Current leader: ${ranked[0].label} by ${counts.format(margin)} votes (${(margin / total * 100).toFixed(2)} percentage points).`,
    statusText,
    snapshotTime: pacificTime.format(new Date(contest.snapshot)),
    statusTime: contest.status.at || contest.status.observedAt ? pacificTime.format(new Date(contest.status.at || contest.status.observedAt)) : null,
    statusTimeLabel: contest.status.observedAt ? 'Call verified as of' : contest.status.kind === 'called' ? 'Called at' : 'Certified at',
    completeness: contest.incomplete
      ? `Incomplete data: ${contest.incompleteNote} Percentages and lead use supplied votes only.`
      : 'Percentages include all supplied responses.',
  };
}
