import { categoryUrl, formatShare, summarizeCases } from './charts';
import { chartCategories, eligibleCases, readable, statusLabels, type Chart, type CaseStudy, type CaseKind } from './cases';

const palette = [
  ['#8b3049', '#efa5b6'], ['#386b94', '#91c9ee'], ['#30786f', '#8bd7c6'],
  ['#946925', '#edc078'], ['#70528e', '#c9afe9'], ['#607082', '#b3c4d6'],
];
export type CaseNode = {
  id: string; label: string; title: string; type: 'root' | 'investigation' | 'category' | 'case';
  count: number; tooltip: string; light: string; dark: string;
  url?: string; value?: number; children?: CaseNode[];
};

// Project only public display fields. Parent values are omitted: amCharts sums
// leaf value:1 itself; supplying both parent counts and leaf values double-counts.
export function caseVisuals(charts: Chart[], studies: CaseStudy[], kind: CaseKind, includeDrafts = false) {
  const records = eligibleCases(charts, studies, includeDrafts).filter(({ data }) => data.content_kind === kind);
  const visibleCharts = charts.filter(({ data }) => includeDrafts || data.publication_status === 'published');
  let colorIndex = 0;
  const donuts = visibleCharts.map((chart) => {
    const summary = summarizeCases(chartCategories(chart, records));
    const categories = summary.slices.map((slice) => {
      const [light, dark] = palette[colorIndex++ % palette.length];
      const count = slice.count ?? 0;
      return { id: slice.id, label: slice.label, count, percentage: slice.percentage, offset: slice.offset,
        light, dark, url: `${categoryUrl(chart.id, slice.id)}#dataset-${kind}`,
        tooltip: `${slice.label}\n${count} ${kind === 'example' ? 'example cases' : 'cases'}${summary.canPlot ? ` · ${formatShare(slice.percentage)}` : ''}\nOpen category`,
      };
    });
    return { id: chart.id, title: chart.data.title, kind, total: summary.total ?? 0, categories };
  });
  const investigations: CaseNode[] = donuts.filter(({ total }) => total > 0).map((donut, index) => {
    const [light, dark] = palette[index % palette.length];
    return { id: `investigation:${donut.id}`, label: donut.title, title: donut.title, type: 'investigation', count: donut.total,
      light, dark, tooltip: `${donut.title}\n${donut.total} cases\nSelect to expand or collapse categories.`,
      children: donut.categories.filter(({ count }) => count > 0).map((category) => ({
        id: `category:${donut.id}:${category.id}`, label: category.label, title: category.label,
        type: 'category', count: category.count, light: category.light, dark: category.dark,
        url: category.url, tooltip: `${category.label}\n${category.count} cases\nSelect to expand or collapse cases.`,
        children: records.filter(({ data }) => data.chart === donut.id && data.category === category.id).map(({ id, data }) => ({
          id: `case:${id}`, label: data.blocks.chart_label ?? id, title: data.title,
          type: 'case', count: 1, value: 1, light: category.light, dark: category.dark,
          url: `${categoryUrl(data.chart, data.category)}#${id}`,
          tooltip: [data.title, data.description_short, statusLabels[data.case_status],
            `Opened: ${data.opened_on ?? 'Not recorded'}`, data.closed_on ? `Completed: ${data.closed_on}` : '',
            data.networks.length ? `Networks: ${data.networks.map(readable).join(', ')}` : '',
            'Open case details.'].filter(Boolean).join('\n'),
        })),
      })),
    };
  });
  const tree: CaseNode = { id: `root:${kind}`, label: kind === 'example' ? 'Example cases' : 'Casework',
    title: kind === 'example' ? 'Example cases' : 'Casework', type: 'root', count: records.length,
    light: '#485567', dark: '#bac8d8', tooltip: `${records.length} ${kind === 'example' ? 'example cases' : 'recorded cases'}\nSelect to expand or collapse investigations.`,
    children: investigations };
  return { kind, total: records.length, donuts, tree };
}

export type CaseDonutData = ReturnType<typeof caseVisuals>['donuts'][number];
export type CaseTreeData = Pick<ReturnType<typeof caseVisuals>, 'kind' | 'total' | 'tree'>;
export type CaseVisualState = { expanded?: string[]; zoom?: { x: number; y: number; scale: number } };
export type CaseVisual = {
  dispose(): void; state(): CaseVisualState; motion(enabled: boolean): void;
  visible(visible: boolean): void; action?(action: string): void;
};
