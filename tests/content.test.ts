import assert from 'node:assert/strict';
import { test } from 'node:test';
import { schemas, type ContentRecord } from '../src/content/schemas';
import { loadContent, validateRecords } from '../scripts/content';
import { categoryUrl, donutSlicePath, formatShare, summarizeCases } from '../src/lib/charts';
import { caseRoutes, chartCategories, caseStatistics, eligibleCases } from '../src/lib/cases';
import { sortExperience, isCurrentPosition } from '../src/lib/experience';

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
  ...base, title: 'Case types',
  categories: [{ id: 'fraud', label: 'Fraud' }, { id: 'other', label: 'Other' }],
};

test('chart definitions reject manual counts, duplicate categories, and stored percentages', () => {
  assert.equal(schemas.charts.safeParse({ ...chart, categories: [{ ...chart.categories[0], count: 3 }] }).success, false);
  assert.equal(schemas.charts.safeParse({ ...chart, categories: [chart.categories[0], chart.categories[0]] }).success, false);
  assert.equal(schemas.charts.safeParse({ ...chart, categories: [{ ...chart.categories[0], percentage: 75 }] }).success, false);
  assert.equal(schemas.charts.safeParse({ ...chart, publication_status: 'published' }).success, true);
});

test('examples cannot be published as actual work and case facts are validated', () => {
  const data = { ...base, title: 'Case', chart: 'example', category: 'fraud' };
  assert.equal(schemas.cases.safeParse({ ...data, publication_status: 'published' }).success, false);
  assert.equal(schemas.cases.safeParse({ ...data, publication_status: 'published', content_kind: 'case_study' }).success, true);
  assert.equal(schemas.cases.safeParse({ ...data, networks: ['bitcoin', 'bitcoin'] }).success, false);
  assert.equal(schemas.cases.safeParse({ ...data, case_status: 'completed', opened_on: '2026-02-01', closed_on: '2026-01-01' }).success, false);
  assert.equal(schemas.cases.safeParse({ ...data, case_status: 'active', closed_on: '2026-01-01' }).success, false);
  assert.equal(schemas.cases.safeParse({ ...data, metrics: { reported_loss_usd: 100 } }).success, false);
  assert.equal(schemas.cases.safeParse({ ...data, metrics: { wallets_reviewed: -1 } }).success, false);
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

const makeChart = (published = true) => ({ id: 'example', data: schemas.charts.parse({ ...chart, publication_status: published ? 'published' : 'draft' }) });
const makeCase = (id: string, overrides: Record<string, unknown> = {}) => ({ id, data: schemas.cases.parse({ ...base, slug: id, title: id, chart: 'example', category: 'fraud', content_kind: 'case_study', publication_status: 'published', ...overrides }) });

test('adding and reclassifying a case updates counts, shares, statistics, and routes together', () => {
  const definition = makeChart();
  const records = [makeCase('one'), makeCase('two', { category: 'other' })];
  const before = summarizeCases(chartCategories(definition, records));
  assert.equal(before.total, 2);
  assert.deepEqual(before.slices.map(({ percentage }) => percentage), [50, 50]);
  records.push(makeCase('three'));
  const after = summarizeCases(chartCategories(definition, records));
  assert.equal(after.total, 3);
  assert.equal(caseStatistics(records).total, 3);
  assert.deepEqual(after.slices.map(({ count }) => count), [2, 1]);
  assert.equal(after.slices[0].percentage, 2 / 3 * 100);
  assert.equal(caseRoutes([definition], records)[0].category.count, 2);
  records[2].data.category = 'other';
  assert.deepEqual(chartCategories(definition, records).map(({ count }) => count), [1, 2]);
});

test('production excludes drafts and examples; preview keeps datasets separate', () => {
  const definition = makeChart();
  const records = [makeCase('public-case'), makeCase('draft-case', { publication_status: 'draft' }), makeCase('sample-case', { content_kind: 'example', publication_status: 'draft' })];
  assert.deepEqual(eligibleCases([definition], records).map(({ id }) => id), ['public-case']);
  const routes = caseRoutes([definition], records, true);
  assert.equal(routes[0].primaryKind, 'case_study');
  assert.equal(routes[0].category.count, 2);
  assert.equal(routes[0].studies.length, 3);
  assert.deepEqual(routes[0].datasets.map(({ kind, category, studies }) => [kind, category.count, studies.length]), [['case_study', 2, 2], ['example', 1, 1]]);
  const examplesOnly = caseRoutes([definition], [records[2]], true);
  assert.equal(examplesOnly[0].primaryKind, 'example');
  assert.equal(examplesOnly[0].category.count, 1);
  assert.deepEqual(caseRoutes([makeChart(false)], records), []);
});

test('empty datasets have known zero totals and no plotted proportions', () => {
  const routes = caseRoutes([makeChart()], []);
  assert.deepEqual(routes.map(({ category }) => category.count), [0, 0]);
  const summary = summarizeCases(routes[0].categories);
  assert.equal(summary.total, 0);
  assert.equal(summary.canPlot, false);
  assert.equal(caseStatistics([]).total, 0);
});

test('unknown metrics remain unknown and financial coverage distinguishes zero from missing', () => {
  const records = [makeCase('unknown'), makeCase('known', { opened_on: '2025-03-01', networks: ['bitcoin', 'ethereum'], case_status: 'active', metrics: { reported_loss_usd: 2500, valuation_date: '2025-03-01', amount_note: 'Documented reported loss.' } }), makeCase('zero', { metrics: { reported_loss_usd: 0, valuation_date: '2025-03-01', amount_note: 'Known zero.' }, networks: ['bitcoin'] })];
  const stats = caseStatistics(records);
  assert.deepEqual(stats.reportedLoss, { total: 2500, coverage: 2 });
  assert.deepEqual(stats.assetsReviewed, { total: 0, coverage: 0 });
  assert.equal(stats.active, 1);
  assert.equal(stats.networks.find(({ label }) => label === 'bitcoin')?.count, 2);
  assert.equal(stats.years.find(({ label }) => label === 'Undated')?.count, 2);
});

test('job frontmatter controls order and supports a confirmed current role with unknown dates', () => {
  const position = (id: string, overrides: Record<string, unknown> = {}) => ({ id, data: schemas.experience.parse({ ...job, slug: id, ...overrides }) });
  const past = position('past', { periods: [{ start: '2024-01', end: '2025-01' }] });
  const current = position('current');
  const adc = position('adc', { periods: [], active_position: true, display_order: 10 });
  assert.equal(isCurrentPosition(adc, '2026-09'), true);
  assert.deepEqual(sortExperience([past, current, adc], '2026-09').map(({ id }) => id), ['adc', 'current', 'past']);
  past.data.display_order = 5;
  assert.deepEqual(sortExperience([current, adc, past], '2026-09').map(({ id }) => id), ['past', 'adc', 'current']);
  assert.equal(schemas.experience.safeParse({ ...job, periods: [] }).success, false);
});
