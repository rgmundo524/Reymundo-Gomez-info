import type { ContentRecord } from '../content/schemas';
import { eligibleCases, readable, statusLabels } from './cases';
import { categoryUrl } from './charts';
import { mdxSearchText } from './mdx-text';

// Explicitly select rendered fields. Editorial notes and unused blocks never enter search.
export function caseSearchRecords(records: ContentRecord[], includeDrafts: boolean) {
  const page = records.find((record) => record.collection === 'pages' && record.data.slug === 'casework');
  if (page?.collection !== 'pages' || (!includeDrafts && page.data.publication_status !== 'published') || !page.data.section_order.includes('charts')) return [];
  const charts = records.filter((record) => record.collection === 'charts').filter((record) => page.data.charts.includes(record.data.slug))
    .map((record) => ({ ...record, id: record.data.slug }));
  const cases = records.filter((record) => record.collection === 'cases').map((record) => ({ ...record, id: record.data.slug }));
  return eligibleCases(charts, cases, includeDrafts).map(({ id, data, body, file }) => {
    const chart = charts.find((chart) => chart.id === data.chart)!;
    const category = chart.data.categories.find(({ id }) => id === data.category)!.label;
    const dataset = data.content_kind === 'example' ? 'Illustrative examples' : 'Case studies';
    return {
      url: `${categoryUrl(data.chart, data.category)}#${id}`,
      language: 'en',
      content: [data.title, data.description_short, chart.data.title, category, readable(data.subcategory ?? 'unspecified'), statusLabels[data.case_status],
        data.opened_on, data.closed_on, data.role, ...data.networks.map(readable), ...data.assets,
        ...data.jurisdictions, ...data.services.map(readable), data.blocks.investigative_question, file.endsWith('.mdx') ? mdxSearchText(body) : body,
        ...data.links.map(({ label }) => label)].filter(Boolean).join('\n'),
      meta: {
        title: `${data.content_kind === 'example' ? 'Example: ' : ''}${data.title}`,
        description: data.description_short, dataset, category,
      },
      filters: {
        Dataset: [dataset], Investigation: [chart.data.title], Category: [category],
        Subcategory: [readable(data.subcategory ?? 'unspecified')],
        Network: data.networks.length ? data.networks.map(readable) : ['Not recorded'],
        Status: [statusLabels[data.case_status]],
      },
    };
  });
}
