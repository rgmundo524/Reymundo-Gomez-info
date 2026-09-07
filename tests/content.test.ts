import assert from 'node:assert/strict';
import { test } from 'node:test';
import { schemas, type ContentRecord } from '../src/content/schemas';
import { loadContent, validateRecords } from '../scripts/content';
import { categoryUrl, donutSlicePath, formatShare, summarizeCases } from '../src/lib/charts';
import { caseRoutes } from '../src/lib/cases';

const base = { slug: 'example', description_short: 'A short description.' };
const job = { ...base, organization: 'Example', role: 'Investigator', periods: [{ start: '2022-09', end: '2025-06' }, { start: '2026-01', end: null }] };

test('a resumed role preserves the gap and defaults to draft', () => {
  const data = schemas.experience.parse(job);
  assert.equal(data.publication_status, 'draft');
  assert.deepEqual(data.periods, job.periods);
});

test('contradictory employment periods and misspelled fields are rejected', () => {
  assert.equal(schemas.experience.safeParse({ ...job, periods: [{ start: '2026-02', end: '2026-01' }] }).success, false);
  assert.equal(schemas.experience.safeParse({ ...job, periods: [{ start: '2025-01', end: null }, { start: '2026-01', end: null }] }).success, false);
  assert.equal(schemas.experience.safeParse({ ...job, Active_position: true }).success, false);
});

test('achievement IDs cannot collide', () => {
  assert.equal(schemas.experience.safeParse({ ...job, highlights: [{ id: 'tracing', text: 'One' }, { id: 'tracing', text: 'Two' }] }).success, false);
});

test('missing references and duplicate slugs report the affected entry', () => {
  const entry: ContentRecord = { collection: 'experience', data: schemas.experience.parse({ ...job, expertise: ['missing'] }), body: 'Text', file: 'experience/example.md' };
  assert.throws(() => validateRecords([entry]), /experience\/example.md.*missing expertise\/missing/);
  assert.throws(() => validateRecords([entry, entry]), /duplicate slug experience\/example/);
});

test('published entries cannot pull in draft references', () => {
  const expertise: ContentRecord = { collection: 'expertise', data: schemas.expertise.parse({ ...base, title: 'Tracing' }), body: 'Text', file: 'expertise/example.md' };
  const experience: ContentRecord = { collection: 'experience', data: schemas.experience.parse({ ...job, publication_status: 'published', expertise: ['example'] }), body: 'Text', file: 'experience/example.md' };
  assert.throws(() => validateRecords([expertise, experience]), /published content references draft/);
  expertise.data.publication_status = 'published';
  assert.doesNotThrow(() => validateRecords([expertise, experience]));
});

test('the actual Markdown collection has valid fields and relationships', async () => {
  const records = await loadContent();
  assert.ok(records.length > 0);
  assert.ok(records.some((record) => record.collection === 'pages' && record.data.slug === 'home'));
});

const chart = {
  ...base, title: 'Case types', source_date: '2026-08-21',
  categories: [{ id: 'fraud', label: 'Fraud', count: 3 }, { id: 'other', label: 'Other', count: 1 }],
};

test('chart counts reject invalid totals, duplicate categories, and stored percentages', () => {
  for (const count of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(schemas.charts.safeParse({ ...chart, categories: [{ id: 'a', label: 'A', count }] }).success, false);
  }
  assert.equal(schemas.charts.safeParse({ ...chart, categories: [{ id: 'a', label: 'A', count: 0 }] }).success, false);
  assert.equal(schemas.charts.safeParse({ ...chart, categories: [chart.categories[0], chart.categories[0]] }).success, false);
  assert.equal(schemas.charts.safeParse({ ...chart, categories: [{ ...chart.categories[0], percentage: 75 }] }).success, false);
});

test('incomplete or unreviewed chart data cannot be published', () => {
  assert.equal(schemas.charts.safeParse({ ...chart, publication_status: 'published' }).success, false);
  assert.equal(schemas.charts.safeParse({ ...chart, data_status: 'confirmed', categories: [{ id: 'a', label: 'A', count: null }] }).success, false);
  assert.equal(schemas.charts.safeParse({ ...chart, publication_status: 'published', data_status: 'confirmed' }).success, true);
});

test('donut shares use the full count total and do not normalize incomplete data', () => {
  const source = [21, 13, 5, 5, 4, 3].map((count, index) => ({ id: `type-${index}`, label: `Type ${index}`, count }));
  const summary = summarizeCases(source);
  assert.equal(summary.total, 51);
  assert.equal(formatShare(summary.slices[1].percentage), '25.5%');
  assert.ok(Math.abs(summary.slices.reduce((sum, slice) => sum + slice.percentage!, 0) - 100) < 1e-10);
  const pending = summarizeCases([{ id: 'a', label: 'A', count: 3 }, { id: 'b', label: 'B', count: null }]);
  assert.equal(pending.canPlot, false);
  assert.equal(pending.total, null);
  assert.ok(pending.slices.every(({ percentage }) => percentage === null));
  const single = summarizeCases([{ id: 'a', label: 'A', count: 2 }, { id: 'b', label: 'B', count: 0 }]);
  assert.deepEqual(single.slices.map(({ percentage }) => percentage), [100, 0]);
  assert.equal(summarizeCases([]).canPlot, false);
});

test('four sample cases produce exact quarter slices and matching category links', () => {
  const categories = ['divorce', 'corporate-civil-lawsuits', 'bankruptcy', 'other']
    .map((id) => ({ id, label: id, count: 1 }));
  const result = summarizeCases(categories);
  assert.equal(result.total, 4);
  assert.deepEqual(result.slices.map(({ percentage }) => percentage), [25, 25, 25, 25]);
  assert.deepEqual(result.slices.map(({ offset }) => offset), [0, 25, 50, 75]);
  assert.equal(categoryUrl('professional-investigations', categories[0].id), '/investigations/professional-investigations/divorce/');
  assert.equal(donutSlicePath(0, 0), '');
  assert.equal((donutSlicePath(0, 100).match(/ A /g) ?? []).length, 4);
  assert.match(donutSlicePath(0, 75), /A 108 108 0 1 1/);
  // Quarter-circle geometry begins at noon and ends at three o'clock.
  const first = donutSlicePath(0, 25).split(' ');
  assert.equal(Number(first[1]), 120);
  assert.equal(Number(first[2]), 12);
  assert.equal(Number(first[9]), 228);
  assert.equal(Number(first[10]), 120);
});

test('case summaries validate their chart and category references', () => {
  const chartEntry: ContentRecord = { collection: 'charts', data: schemas.charts.parse(chart), body: 'Chart', file: 'charts/example.md' };
  const study: ContentRecord = { collection: 'cases', data: schemas.cases.parse({ ...base, title: 'Case', chart: 'example', category: 'fraud' }), body: 'Case', file: 'cases/example.md' };
  assert.doesNotThrow(() => validateRecords([chartEntry, study]));
  study.data.category = 'missing';
  assert.throws(() => validateRecords([chartEntry, study]), /category references missing charts\/example\/missing/);
  study.data.category = 'fraud';
  study.data.chart = 'missing';
  assert.throws(() => validateRecords([chartEntry, study]), /references missing charts\/missing/);
});

test('category routes filter drafts and preserve aggregate counts independently of summaries', () => {
  const charts = [{ id: 'criminal', data: { publication_status: 'published', categories: [{ id: 'fraud', label: 'Fraud', count: 21 }] } },
    { id: 'professional', data: { publication_status: 'draft', categories: [{ id: 'other', label: 'Other', count: 1 }] } }];
  const studies = [
    { id: 'public-case', data: { publication_status: 'published', chart: 'criminal', category: 'fraud' } },
    { id: 'draft-case', data: { publication_status: 'draft', chart: 'criminal', category: 'fraud' } },
    { id: 'other-case', data: { publication_status: 'draft', chart: 'professional', category: 'other' } },
  ];
  const routes = caseRoutes(charts, studies);
  assert.equal(routes.length, 1);
  assert.deepEqual(routes[0].studies.map(({ id }) => id), ['public-case']);
  assert.equal(routes[0].category.count, 21);
  const preview = caseRoutes(charts, studies, true);
  assert.deepEqual(preview.map(({ studies }) => studies.map(({ id }) => id)), [['public-case', 'draft-case'], ['other-case']]);
});
