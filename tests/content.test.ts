import assert from 'node:assert/strict';
import { test } from 'node:test';
import { schemas, type ContentRecord } from '../src/content/schemas';
import { loadContent, validateRecords } from '../scripts/content';
import { categoryUrl, donutSlicePath, formatShare, summarizeCases } from '../src/lib/charts';
import { caseRoutes, chartCategories, caseStatistics, eligibleCases } from '../src/lib/cases';
import { sortExperience, isCurrentPosition, plotExperience } from '../src/lib/experience';
import { formatPeriods } from '../src/lib/dates';
import { visibleArticles } from '../src/lib/articles';
import { caseSearchRecords } from '../src/lib/search';
import { createSearchCache } from '../scripts/search-index';

const base = { slug: 'example', description_short: 'A short description.' };

test('articles validate dates, sort newest first, and exclude drafts from publication', () => {
  const article = { ...base, title: 'Article' };
  assert.equal(schemas.articles.safeParse({ ...article, publication_status: 'published' }).success, false);
  assert.equal(schemas.articles.safeParse({ ...article, published_on: '2026-05-01', updated_on: '2026-04-30' }).success, false);
  const entries = [
    { id: 'draft', data: schemas.articles.parse(article) },
    { id: 'older', data: schemas.articles.parse({ ...article, publication_status: 'published', published_on: '2026-01-01' }) },
    { id: 'newer', data: schemas.articles.parse({ ...article, publication_status: 'published', published_on: '2026-06-01' }) },
  ];
  assert.deepEqual(visibleArticles(entries, false).map(({ id }) => id), ['newer', 'older']);
  assert.deepEqual(visibleArticles(entries, true).map(({ id }) => id), ['newer', 'older', 'draft']);
});

test('article case references cannot silently break or publish a draft case', () => {
  const article: ContentRecord = { collection: 'articles', data: schemas.articles.parse({ ...base, title: 'Article', publication_status: 'published', published_on: '2026-01-01', related_cases: ['missing'] }), body: 'Article', file: 'articles/test.md' };
  assert.throws(() => validateRecords([article]), /related_cases references missing cases\/missing/);
  const study: ContentRecord = { collection: 'cases', data: schemas.cases.parse({ ...base, slug: 'missing', title: 'Draft case', chart: 'example', category: 'fraud' }), body: 'Draft', file: 'cases/missing.md' };
  assert.throws(() => validateRecords([article, study]), /published content references draft cases\/missing/);
});

test('search respects case visibility, exact anchors, and per-case filters without indexing editorial notes', async () => {
  const records = await loadContent();
  const previews = caseSearchRecords(records, true);
  assert.equal(previews.length, 13);
  assert.equal(new Set(previews.map(({ url }) => url)).size, 13);
  assert.deepEqual(caseSearchRecords(records, false), []);
  for (const record of records) {
    if (record.collection === 'cases') {
      record.data.editorial_note = 'EDITORIAL_SECRET_SENTINEL';
      record.data.blocks.unused_private_block = 'UNUSED_BLOCK_SENTINEL';
      const found = previews.find(({ url }) => url.endsWith(`#${record.data.slug}`))!;
      assert.equal(found.url, `${categoryUrl(record.data.chart, record.data.category)}#${record.data.slug}`);
      assert.deepEqual(found.filters.Network, record.data.networks.length ? record.data.networks.map((value) => value.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')) : ['Not recorded']);
    }
  }
  assert.doesNotMatch(JSON.stringify(caseSearchRecords(records, true)), /EDITORIAL_SECRET_SENTINEL|UNUSED_BLOCK_SENTINEL/);
  const publicRecords = structuredClone(records);
  for (const record of publicRecords) if (record.collection !== 'cases') record.data.publication_status = 'published';
  const study = publicRecords.find((record) => record.collection === 'cases')!;
  assert.equal(study.collection, 'cases');
  if (study.collection !== 'cases') return;
  study.data.content_kind = 'case_study';
  study.data.publication_status = 'published';
  assert.equal(caseSearchRecords(publicRecords, false).length, 1);
  assert.deepEqual(caseSearchRecords(publicRecords, false)[0].filters.Dataset, ['Case studies']);
  study.data.category = publicRecords.filter((record) => record.collection === 'charts').find(({ data }) => data.slug === study.data.chart)!.data.categories.find(({ id }) => id !== study.data.category)!.id;
  assert.equal(caseSearchRecords(publicRecords, false)[0].url, `${categoryUrl(study.data.chart, study.data.category)}#${study.data.slug}`);
  publicRecords.splice(publicRecords.indexOf(study), 1);
  assert.equal(caseSearchRecords(publicRecords, false).length, 0);
});

test('development search discards superseded builds and refuses stale content after errors', async () => {
  let builds = 0;
  let release: (() => void) | undefined;
  let fail = false;
  const cache = createSearchCache(async () => {
    const number = ++builds;
    if (number === 1) await new Promise<void>((resolve) => { release = resolve; });
    if (fail) throw new Error('Invalid content');
    return [{ path: 'pagefind.js', content: new TextEncoder().encode(String(number)) }];
  });
  const first = cache.files();
  const concurrent = cache.files();
  cache.invalidate();
  release!();
  assert.equal(new TextDecoder().decode((await first).get('pagefind.js')), '2');
  assert.equal(await concurrent, await cache.files());
  assert.equal(builds, 2);
  fail = true;
  cache.invalidate();
  await assert.rejects(cache.files(), /Invalid content/);
  fail = false;
  assert.equal(new TextDecoder().decode((await cache.files()).get('pagefind.js')), '4');
});
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

test('employment plot uses a shared month scale and preserves gaps and overlapping roles', () => {
  const entries = [
    { id: 'resumed', data: { display_order: 10, periods: [{ start: '2020-01', end: '2020-06' }, { start: '2021-09', end: null }] } },
    { id: 'concurrent', data: { display_order: 20, periods: [{ start: '2020-04', end: '2021-05' }] } },
  ];
  const result = plotExperience(entries, '2021-12');
  assert.equal(result.span, 24);
  assert.deepEqual(result.ticks.map(({ year }) => year), [2020, 2021]);
  assert.equal(result.present, 100);
  const [resumed, concurrent] = result.rows;
  assert.equal(resumed.periods.length, 2);
  assert.equal(resumed.periods[0].left, 0);
  assert.equal(resumed.periods[0].width, 25); // Six inclusive months of 24.
  assert.equal(resumed.periods[1].left, 20 / 24 * 100);
  assert.equal(resumed.periods[1].width, 4 / 24 * 100);
  assert.ok(concurrent.periods[0].left < resumed.periods[0].left + resumed.periods[0].width);
  assert.equal(concurrent.periods[0].width, 14 / 24 * 100);
  assert.ok(resumed.periods[1].left > resumed.periods[0].left + resumed.periods[0].width);
  entries[0].data.display_order = 30;
  const reordered = plotExperience(entries, '2021-12');
  assert.equal(reordered.rows[0].entry.id, 'concurrent');
  assert.deepEqual(reordered.rows[1].periods, resumed.periods);
});

test('unknown and future start dates do not create fictitious employment bars', () => {
  const undated = { id: 'adc', data: { active_position: true, periods: [] } };
  assert.equal(plotExperience([undated], '2026-09').rows.length, 0);
  assert.deepEqual(plotExperience([undated], '2026-09').undated.map(({ id }) => id), ['adc']);
  const planned = plotExperience([{ id: 'future', data: { periods: [{ start: '2027-01', end: null }] } }], '2026-09');
  assert.equal(planned.rows[0].periods[0].planned, true);
  assert.equal(planned.rows[0].periods[0].scheduled, true);
  assert.equal(formatPeriods([{ start: '2027-01', end: null }], '2026-09'), 'Starts Jan 2027');
  assert.equal(formatPeriods([{ start: '2027-01', end: '2027-06' }], '2026-09'), 'Scheduled Jan 2027 to Jun 2027');
  assert.equal(planned.rows[0].periods[0].current, false);
  assert.equal(planned.rows[0].periods[0].width, 0);
  assert.ok(planned.rows[0].periods[0].left < 100);
  assert.ok(planned.present < planned.rows[0].periods[0].left);
});

test('open roles extend with the build month and single-month roles retain duration', () => {
  const entries = [{ id: 'current', data: { periods: [{ start: '2026-01', end: null }] } }];
  const september = plotExperience(entries, '2026-09');
  const october = plotExperience(entries, '2026-10');
  assert.equal(september.span, 9);
  assert.equal(october.span, 10);
  assert.equal(september.rows[0].periods[0].width, 100);
  assert.equal(october.rows[0].periods[0].width, 100);
  const single = plotExperience([{ id: 'one-month', data: { periods: [{ start: '2026-03', end: '2026-03' }] } }], '2026-09');
  assert.equal(single.rows[0].periods[0].width, 1 / 9 * 100);
});
