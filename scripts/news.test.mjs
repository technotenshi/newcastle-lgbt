import assert from 'node:assert/strict';
import test from 'node:test';
import {
  articlePath,
  findPublishedArticle,
  listFeedItems,
  listPublishedNews,
  pacificToday,
} from '../utils/news.mjs';

const row = (id, meta, extra = {}) => ({
  id,
  path: `/news/${id}`,
  title: `Title ${id}`,
  description: '',
  body: undefined,
  ...extra,
  meta,
});

const TODAY = '2026-11-07';

test('pacificToday uses the Pacific calendar day, not UTC', () => {
  // 2026-11-08T03:30Z is still 7:30 pm on November 7 in Pacific time.
  assert.equal(pacificToday(new Date('2026-11-08T03:30:00Z')), '2026-11-07');
  // 2026-11-08T08:30Z is 12:30 am on November 8 in Pacific time.
  assert.equal(pacificToday(new Date('2026-11-08T08:30:00Z')), '2026-11-08');
});

test('published means no draft flag and a date on or before today', () => {
  const rows = [
    row('past', { date: '2026-11-06', slug: 'past' }),
    row('today', { date: TODAY, slug: 'today' }),
    row('future', { date: '2026-11-08', slug: 'future' }),
    row('draft', { date: '2026-11-01', slug: 'draft', draft: true }),
    row('underscore', { date: '2026-11-01', slug: 'underscore', _draft: true }),
    row('undated', { slug: 'undated' }),
  ];

  const ids = listPublishedNews(rows, TODAY).map(entry => entry._id);
  assert.deepEqual(new Set(ids), new Set(['past', 'today', 'undated']));
});

test('a date is published from Pacific midnight, in every function that applies the rule', () => {
  const rows = [row('tomorrow', { date: '2026-11-08', slug: 'tomorrow' })];
  const target = { date: '2026-11-08', slug: 'tomorrow' };
  // 07:59Z on Nov 8 is 11:59 pm on Nov 7 in Pacific time; 08:00Z is midnight.
  const before = pacificToday(new Date('2026-11-08T07:59:00Z'));
  const after = pacificToday(new Date('2026-11-08T08:00:00Z'));

  assert.equal(listPublishedNews(rows, before).length, 0);
  assert.equal(findPublishedArticle(rows, target, before), null);
  assert.equal(listFeedItems(rows, before, 5).length, 0);

  assert.equal(listPublishedNews(rows, after).length, 1);
  assert.equal(findPublishedArticle(rows, target, after)._path, '/news/2026/11/08/tomorrow');
  assert.equal(listFeedItems(rows, after, 5).length, 1);
});

test('includeDrafts lists everything', () => {
  const rows = [row('a', { date: '2026-11-08', slug: 'a', draft: true })];
  assert.equal(listPublishedNews(rows, TODAY, { includeDrafts: true }).length, 1);
});

test('listings sort newest first, then by higher order within a day', () => {
  const rows = [
    row('old', { date: '2026-10-01', slug: 'old' }),
    row('low', { date: '2026-11-01', slug: 'low', order: 1 }),
    row('high', { date: '2026-11-01', slug: 'high', order: '5' }),
    row('none', { date: '2026-11-01', slug: 'none' }),
  ];

  assert.deepEqual(listPublishedNews(rows, TODAY).map(entry => entry._id), ['high', 'low', 'none', 'old']);
  assert.deepEqual(listPublishedNews(rows, TODAY, { limit: 2 }).map(entry => entry._id), ['high', 'low']);
});

test('meta may arrive as a JSON string', () => {
  const rows = [row('s', JSON.stringify({ date: '2026-11-01', slug: 'in-json' }))];
  assert.equal(listPublishedNews(rows, TODAY)[0]._path, '/news/2026/11/01/in-json');
});

test('canonical path comes from date and slug, else the content path', () => {
  assert.equal(articlePath('2026-1-2', ' a-slug '), '/news/2026/01/02/a-slug');
  assert.equal(articlePath('26-01-02', 'x'), undefined);
  assert.equal(articlePath('2026-01-02', '  '), undefined);
  assert.equal(articlePath(undefined, 'x'), undefined);

  const [entry] = listPublishedNews([row('x', { date: '2026-11', slug: 'x' })], TODAY);
  assert.equal(entry._path, '/news/x');
});

test('summary prefers excerpt, then meta description, row description, then body text', () => {
  const body = { type: 'root', children: [{ type: 'text', value: 'From   the body.' }] };
  const summaryOf = (meta, extra) => listPublishedNews([row('a', { date: '2026-11-01', slug: 'a', ...meta }, extra)], TODAY)[0].summary;

  assert.equal(summaryOf({ excerpt: 'Excerpt', description: 'Meta' }, { description: 'Row' }), 'Excerpt');
  assert.equal(summaryOf({ description: 'Meta' }, { description: 'Row' }), 'Meta');
  assert.equal(summaryOf({}, { description: ' Row ' }), 'Row');
  assert.equal(summaryOf({}, { body: JSON.stringify(body) }), 'From the body.');
  assert.equal(summaryOf({}, {}), '');
  assert.equal(summaryOf({ description: 'word '.repeat(60) }).length <= 160, true);
});

test('findPublishedArticle returns the full document or null', () => {
  const rows = [
    row('live', { date: '2026-11-01', slug: 'live', carousel: { images: [] }, excerpt: 'Short' }, { body: { type: 'root' } }),
    row('draft', { date: '2026-11-01', slug: 'draft', draft: true }),
    row('future', { date: '2026-11-09', slug: 'future' }),
  ];

  const article = findPublishedArticle(rows, { date: '2026-11-01', slug: 'live' }, TODAY);
  assert.equal(article._path, '/news/2026/11/01/live');
  assert.deepEqual(article.body, { type: 'root' });
  assert.deepEqual(article.carousel, { images: [] });
  assert.equal(article.excerpt, 'Short');

  assert.equal(findPublishedArticle(rows, { date: '2026-11-01', slug: 'draft' }, TODAY), null);
  const hidden = [row('h', { date: '2026-11-01', slug: 'h', _draft: true })];
  assert.equal(findPublishedArticle(hidden, { date: '2026-11-01', slug: 'h' }, TODAY), null);
  assert.equal(findPublishedArticle(rows, { date: '2026-11-09', slug: 'future' }, TODAY), null);
  assert.equal(findPublishedArticle(rows, { date: '2026-11-01', slug: 'missing' }, TODAY), null);
  assert.equal(findPublishedArticle(rows, { date: '2026-11-02', slug: 'live' }, TODAY), null);
});

test('feed items skip drafts and future dates, cap before skipping, and keep UTC midnight dates', () => {
  const rows = [
    row('a', { date: '2026-11-06', slug: 'a' }, { description: 'Alpha  ' }),
    row('draft', { date: '2026-11-05', slug: 'draft', draft: true }),
    row('future', { date: '2026-11-08', slug: 'future' }),
    row('noslug', { date: '2026-11-04' }),
    row('b', { date: '2026-11-03', slug: 'b' }),
  ];

  const items = listFeedItems(rows, TODAY, 2);
  assert.deepEqual(items.map(item => item.path), ['/news/2026/11/06/a']);
  assert.equal(items[0].description, 'Alpha');
  assert.equal(items[0].published.toISOString(), '2026-11-06T00:00:00.000Z');
  assert.deepEqual(listFeedItems(rows, TODAY, 20).map(item => item.path), ['/news/2026/11/06/a', '/news/2026/11/03/b']);
});

test('feed titles prefer a non-empty row title, then meta title, then Untitled', () => {
  const rows = [
    row('a', { date: '2026-11-03', slug: 'a', title: 'From meta' }, { title: '   ' }),
    row('b', { date: '2026-11-02', slug: 'b' }, { title: ' Trimmed ' }),
    row('c', { date: '2026-11-01', slug: 'c' }, { title: '' }),
  ];

  assert.deepEqual(listFeedItems(rows, TODAY, 5).map(item => item.title), ['From meta', 'Trimmed', 'Untitled']);
});

test('feed links pad month and day from the date as written', () => {
  const [item] = listFeedItems([row('a', { date: '2026-1-2', slug: 'a' })], TODAY, 5);
  assert.equal(item.path, '/news/2026/01/02/a');
});

test('null image fields read as absent', () => {
  const rows = [row('a', { date: '2026-11-01', slug: 'a', image: null, carousel: null })];
  assert.equal(listPublishedNews(rows, TODAY)[0].image, undefined);
  assert.equal(findPublishedArticle(rows, { date: '2026-11-01', slug: 'a' }, TODAY).carousel, undefined);
});
