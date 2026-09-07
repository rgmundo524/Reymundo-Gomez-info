import { categoryUrl, type CaseCategory } from './charts';

type Chart = { id: string; data: { publication_status: string; categories: CaseCategory[] } };
type CaseStudy = { id: string; data: { publication_status: string; chart: string; category: string } };

// Preserve the collection entry types so Astro can render each Markdown body.
export function caseRoutes<C extends Chart, S extends CaseStudy>(charts: C[], studies: S[], includeDrafts = false) {
  return charts.filter((chart) => includeDrafts || chart.data.publication_status === 'published')
    .flatMap((chart) => chart.data.categories.map((category) => ({
      chart,
      category,
      url: categoryUrl(chart.id, category.id),
      studies: studies.filter(({ data }) => data.chart === chart.id && data.category === category.id
        && (includeDrafts || data.publication_status === 'published')),
    })));
}
