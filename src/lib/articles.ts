import type { ContentData } from '../content/schemas';

type Article = { id: string; data: ContentData<'articles'> };

export function visibleArticles<T extends Article>(entries: T[], includeDrafts: boolean): T[] {
  return entries.filter(({ data }) => includeDrafts || data.publication_status === 'published')
    .sort((a, b) => (b.data.published_on ?? '').localeCompare(a.data.published_on ?? '') || a.id.localeCompare(b.id));
}

export function articleDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
