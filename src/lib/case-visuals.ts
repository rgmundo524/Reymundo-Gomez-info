import { categoryUrl, formatShare, summarizeCases } from './charts';
import { caseSubcategories, chartCategories, eligibleCases, readable, statusLabels, subcategoryAnchor, type Chart, type CaseStudy, type CaseKind } from './cases';

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
  const groups = visibleCharts.map((chart, index) => {
    const summary = summarizeCases(chartCategories(chart, records));
    const categories = summary.slices.map((slice) => {
      const [light, dark] = palette[colorIndex++ % palette.length];
      const count = slice.count ?? 0;
      const subcategories = caseSubcategories(records.filter(({ data }) => data.chart === chart.id && data.category === slice.id))
        .map(({ id, label, count: subCount }) => ({ id, label, count: subCount,
          percentage: summary.total ? subCount / summary.total * 100 : 0,
          categoryPercentage: count ? subCount / count * 100 : 0,
          url: `${categoryUrl(chart.id, slice.id)}#${subcategoryAnchor(kind, id)}`,
        }));
      return { id: slice.id, label: slice.label, count, percentage: slice.percentage, offset: slice.offset,
        light, dark, subcategories, url: `${categoryUrl(chart.id, slice.id)}#dataset-${kind}`,
        tooltip: `${slice.label}\n${count} ${kind === 'example' ? 'example cases' : 'cases'}${summary.canPlot ? ` · ${formatShare(slice.percentage)}` : ''}\nOpen category`,
      };
    });
    const [light, dark] = palette[index % palette.length];
    return { id: chart.id, title: chart.data.title, kind, total: summary.total ?? 0, light, dark, categories };
  });
  const investigations: CaseNode[] = groups.filter(({ total }) => total > 0).map((group) => {
    return { id: `investigation:${group.id}`, label: group.title, title: group.title, type: 'investigation', count: group.total,
      light: group.light, dark: group.dark, tooltip: `${group.title}\n${group.total} cases\nSelect to expand or collapse categories.`,
      children: group.categories.filter(({ count }) => count > 0).map((category) => ({
        id: `category:${group.id}:${category.id}`, label: category.label, title: category.label,
        type: 'category', count: category.count, light: category.light, dark: category.dark,
        url: category.url, tooltip: `${category.label}\n${category.count} cases\nSelect to expand or collapse cases.`,
        children: records.filter(({ data }) => data.chart === group.id && data.category === category.id).map(({ id, data }) => ({
          id: `case:${id}`, label: data.blocks.chart_label ?? id, title: data.title,
          type: 'case', count: 1, value: 1, light: category.light, dark: category.dark,
          url: `${categoryUrl(data.chart, data.category)}#${id}`,
          tooltip: [data.title, data.description_short, statusLabels[data.case_status],
            `Subcategory: ${readable(data.subcategory ?? 'unspecified')}`,
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
  return { kind, total: records.length, groups, tree };
}

export type CasePieData = ReturnType<typeof caseVisuals>['groups'][number];
export type CaseTreeData = Pick<ReturnType<typeof caseVisuals>, 'kind' | 'total' | 'tree'>;
export type CaseVisualState = { pieCategory?: string | null; expanded?: string[]; zoom?: { x: number; y: number; scale: number } };
export type CaseVisual = {
  dispose(): void; state(): CaseVisualState; motion(enabled: boolean): void;
  visible(visible: boolean): void; action?(action: string): void;
};

export type CasePieSlice = {
  id: string; category: string; level: 'category' | 'subcategory'; label: string; shade: number;
  count: number; percentage: number; light: string; dark: string; tooltip: string;
};

// Replace only the selected parent with its children, preserving the same full
// investigation denominator and leaving every other category slice in place.
export function casePieSlices(data: CasePieData, expanded: string | null = null): CasePieSlice[] {
  if (!data.total) return [];
  const countText = (count: number) => `${count} ${data.kind === 'example' ? 'example ' : ''}${count === 1 ? 'case' : 'cases'}`;
  return data.categories.filter(({ count }) => count > 0).flatMap<CasePieSlice>((category) => {
    if (category.id === expanded) return category.subcategories.map((subcategory, index) => {
      return { id: `subcategory:${data.id}:${category.id}:${subcategory.id}`, category: category.id, level: 'subcategory',
        label: subcategory.label, count: subcategory.count, percentage: subcategory.percentage,
        light: category.light, dark: category.dark, shade: (index % 3 - 1) * 0.12,
        tooltip: `${subcategory.label}\n${category.label} · ${data.title}\n${countText(subcategory.count)} · ${formatShare(subcategory.percentage)} of this chart\n${formatShare(subcategory.categoryPercentage)} of ${category.label}\nSelect to return to categories.`,
      };
    });
    const percentage = category.count / data.total * 100;
    return [{ id: `category:${data.id}:${category.id}`, category: category.id, level: 'category',
      label: category.label, count: category.count, percentage, light: category.light, dark: category.dark, shade: 0,
      tooltip: `${category.label}\n${data.title}\n${countText(category.count)} · ${formatShare(percentage)} of this chart\nSelect to break down by subcategory.`,
    }];
  });
}
