import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { renderElectionMarkdown } from './election-results-render.mjs';

test('rendered seat summaries show units, comparison and uncalled without vote leads', async () => {
  const contest = { id: 'house', title: 'House', type: 'seats', unit: 'seats', total: 100,
    source: 'AP', snapshot: '2026-11-04T18:05:00-08:00', status: { kind: 'accounting' },
    results: [{ id: 'd', label: 'Democratic', party: 'Democratic', seats: 54 },
      { id: 'r', label: 'Republican', party: 'Republican', seats: 44 },
      { id: 'u', label: 'Uncalled', uncalled: true, seats: 2 }] };
  const { html } = await renderElectionMarkdown(`::election-results\n---\ncontest: ${JSON.stringify(contest)}\n---\n::`);
  assert.match(html, /54 seats/);
  assert.match(html, /Uncalled/);
  assert.doesNotMatch(html, /votes|Current leader/);
  assert.match(html, /election-results-gray/);
});

test('a sourced call without a confirmed timestamp renders its attribution without a status slot', async () => {
  const contest = { id: 'fixture', title: 'Untimed call', type: 'candidate',
    source: 'Official returns', snapshot: '2026-11-04T17:52:00-08:00',
    status: { kind: 'called', resultId: 'a', source: 'AP via The Seattle Times' },
    results: [{ id: 'a', label: 'Candidate A', party: 'Independent', votes: 2 },
      { id: 'b', label: 'Candidate B', party: 'Nonpartisan', votes: 1 }] };
  const { html } = await renderElectionMarkdown(`::election-results\n---\ncontest: ${JSON.stringify(contest)}\n---\n::`);
  assert.match(html, /Attributed call: Candidate A\. Uncertified\./);
  assert.match(html, /AP via The Seattle Times/);
  assert.doesNotMatch(html, /Called at|Call verified as of|Invalid Date/);
  assert.equal((html.match(/<time\b/g) || []).length, 1, 'only the count snapshot has a confirmed timestamp');
});

test('MDC structured props render readable counts, decorative tracks and native source footnotes', async () => {
  const { html } = await renderElectionMarkdown(`
::election-results
---
contest:
  id: IL26-638
  title: Restrict girls’ school sports participation
  type: measure
  source: Official media export
  snapshot: "2026-11-04T17:52:00-08:00"
  status:
    kind: leading
  results:
    - { id: yes, label: "Yes", votes: 1252863, stance: harmful }
    - { id: no, label: "No", votes: 961810, stance: favorable }
---
#source
Count evidence.[^5]
::

[^5]: Official count export.
`);
  assert.match(html, /<section[^>]+aria-label="IL26-638: Restrict/);
  assert.match(html, /1,252,863 votes/);
  assert.match(html, /56\.57%/);
  assert.match(html, /Harms LGBTQ\+ rights/);
  assert.match(html, /Supports LGBTQ\+ rights/);
  assert.match(html, /<ul/);
  assert.equal((html.match(/aria-hidden="true"/g) || []).length, 2);
  assert.match(html, /width:56\.57%/);
  assert.match(html, /href="#user-content-fn-5"/);
  assert.doesNotMatch(html, /\[\^5\]|NaN|<script/);
});

test('the real article embeds exactly the three official initiative snapshots and separate AP evidence', async () => {
  const article = await readFile(new URL('../content/news/20261104-01-election-results-lgbtq-washington.md', import.meta.url), 'utf8');
  const initiativeSection = article.slice(article.indexOf('## Washington initiatives:'), article.indexOf('### I-638:'));
  const blocks = initiativeSection.match(/::election-results\n[\s\S]*?\n::/g) || [];
  assert.equal(blocks.length, 3);
  // Include the article's actual source definitions so repeat citations use MDC's footnote handling.
  const sources = article.slice(article.indexOf('## Sources'));
  const { html } = await renderElectionMarkdown(`${blocks.join('\n\n')}\n\n${sources}`);
  for (const value of ['1,400,925', '1,071,500', '1,155,950', '1,265,082', '1,051,666', '1,432,066', '56.66%', '52.25%', '57.66%']) {
    assert.ok(html.includes(value), value);
  }
  assert.match(html, /Attributed call: Yes\. Uncertified\.<\/strong><div[^>]*>Associated Press/);
  assert.match(html, /Projected to pass\./);
  assert.match(html, /https:\/\/www\.seattletimes\.com\/seattle-news\/politics\/washington-state-election-results-2026\//);
  assert.doesNotMatch(html, /6:14|6:21|timezone unconfirmed|site.owner/i);
  assert.equal((html.match(/4:41 PM PST/g) || []).length, 3);
  assert.equal((html.match(/Harms LGBTQ\+ rights/g) || []).length, 3);
  assert.equal((html.match(/Supports LGBTQ\+ rights/g) || []).length, 3);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'native repeated citations must keep unique reference IDs');
});

test('the six expanded sections render all 19 additional snapshots without tables', async () => {
  const article = await readFile(new URL('../content/news/20261104-01-election-results-lgbtq-washington.md', import.meta.url), 'utf8');
  const headings = ['Newcastle\'s legislative and congressional races', 'Olympia: larger Democratic majorities if leads hold', 'Washington Supreme Court: four of our five picks lead', 'King County offices and courts', 'Pierce County: anti-trans sheriff on track to survive both accountability measures', 'Nationally: Democrats win both chambers of Congress'];
  const expected = [3, 2, 5, 4, 2, 3];
  let total = 0;
  for (const [index, heading] of headings.entries()) {
    const start = article.indexOf(`## ${heading}`);
    assert.ok(start >= 0, heading);
    const end = article.indexOf('\n## ', start + 3);
    const section = article.slice(start, end < 0 ? undefined : end);
    assert.doesNotMatch(section, /^\|/m, heading);
    const blocks = section.match(/::election-results\n[\s\S]*?\n::/g) || [];
    assert.equal(blocks.length, expected[index], heading);
    total += blocks.length;
  }
  assert.equal(total + 3, 22);
  const local = article.slice(article.indexOf('## Newcastle\'s legislative and congressional races'), article.indexOf('## Olympia:'));
  assert.equal((local.match(/source: Washington Secretary of State official media export/g) || []).length, 3);
  assert.equal((local.match(/2026-11-05T16:41:00-08:00/g) || []).length, 3);
  assert.equal((local.match(/Official districtwide vote totals\.\[\^5\]/g) || []).length, 3);
  const { html } = await renderElectionMarkdown(article.slice(article.indexOf('## Washington initiatives:')));
  for (const position of [1, 3, 4, 5, 7]) {
    assert.match(html, new RegExp(`<h3[^>]*>Supreme Court Position ${position}: Washington Supreme Court</h3>`));
  }
  for (const value of ['133,870 votes', '43,322 votes', '1,205 votes', '33,757 votes', '13,922 votes', '94 votes', '28,220 votes', '18,941 votes', '79 votes', '1,375,605 votes', '926,791 votes', '5,447 votes', '1,319,055 votes', '972,113 votes', '6,852 votes', '1,159,173 votes', '1,104,752 votes', '8,137 votes', '1,262,970 votes', '1,017,911 votes', '6,435 votes', '1,446,259 votes', '833,868 votes', '6,292 votes', '457,995 votes', '11,108 votes', '419,978 votes', '160,180 votes', '2,596 votes', '462,436 votes', '8,262 votes', '98,286 votes', '54,407 votes', '1,104 votes', '104,657 votes', '221,840 votes', '155,928 votes', '167,977 votes', '67 seats', '31 seats', '18 seats', '253 seats', '155 seats', '27 seats', '54 seats', '44 seats', '28 governorships', '20 governorships', '2 governorships', 'Call verified as of', 'Before: 59; change: +8', 'Before: 39; change: -8', 'Before: 30; change: +1', 'Before: 19; change: -1', 'Uncalled', '52 Democrats plus two independents']) assert.ok(html.includes(value), value);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, target] of html.matchAll(/href="#(user-content-fn-[^"]+)"/g)) assert.ok(ids.includes(target), `missing footnote ${target}`);
  assert.doesNotMatch(html, /Associated Press, supplied screenshot; original page URL not provided/);
});

test('candidate fixture renders all ballot entries, party labels and the incomplete-data warning', async () => {
  const markdown = await readFile(new URL('./fixtures/election-results.md', import.meta.url), 'utf8');
  const { html } = await renderElectionMarkdown(markdown);
  for (const text of ['Democratic', 'Republican', 'Libertarian', 'Green', 'Independent', 'Local party', 'Nonpartisan', 'Write-ins', '40.00%', '20.00%', '15.00%', '10.00%', '5.00%', 'Incomplete data:']) {
    assert.ok(html.includes(text), text);
  }
  for (const tone of ['blue', 'red', 'gold', 'green', 'gray']) assert.ok(html.includes(`election-results-${tone}`), tone);
  assert.ok(html.indexOf('Candidate A') < html.indexOf('Candidate B'));
  assert.match(html, /Candidate B by 200 votes/);
});

test('rendered zero, tied and certified states stay readable without scripts or color', async () => {
  const base = {
    id: 'fixture', title: 'Synthetic contest', type: 'candidate', source: 'Synthetic data',
    snapshot: '2026-11-04T17:52:00-08:00', status: { kind: 'leading' },
    results: [
      { id: 'a', label: 'A < B & C', party: 'Independent', votes: 0 },
      { id: 'b', label: 'Candidate B', party: 'Nonpartisan', votes: 0 },
    ],
  };
  const render = contest => renderElectionMarkdown(`::election-results\n---\ncontest: ${JSON.stringify(contest)}\n---\n::`);
  const zero = await render(base);
  assert.match(zero.html, /No votes reported\./);
  assert.match(zero.html, /Share unavailable/);
  assert.doesNotMatch(zero.html, /NaN|Infinity|0\.00%/);
  assert.match(zero.html, /A &lt; B &amp; C/);
  const tie = await render({ ...base, results: base.results.map(row => ({ ...row, votes: 5 })) });
  assert.match(tie.html, /Tied: A &lt; B &amp; C, Candidate B with 5 votes each\./);
  const certified = await render({ ...base,
    results: [base.results[0], { ...base.results[1], votes: 1 }],
    status: { kind: 'certified', resultId: 'b', source: 'Synthetic authority', at: '2026-11-24T12:00:00-08:00' },
  });
  assert.match(certified.html, /Certified result: Candidate B\./);
  assert.match(certified.html, /Synthetic authority/);
  assert.match(certified.html, /Nov 24, 2026, 12:00 PM PST/);
});
