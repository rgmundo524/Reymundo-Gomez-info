import type { ContentData } from '../content/schemas';

export type ResourceCategory = ContentData<'resources'>['category'];
type Resource = { id: string; data: ContentData<'resources'> };
export const resourceGroups: Record<ResourceCategory, { title: string; icon: string }> = {
  'first-steps': { title: 'First steps', icon: 'lucide:lightbulb' },
  reporting: { title: 'Reporting and support', icon: 'lucide:hand-heart' },
  'avoid-scams': { title: 'Avoid follow-up scams', icon: 'lucide:shield-check' },
  reports: { title: 'Reports and reference', icon: 'lucide:book-open' },
};

export function groupResources<T extends Resource>(entries: T[], order: ResourceCategory[], includeDrafts: boolean) {
  const visible = entries.filter(({ data }) => includeDrafts || data.publication_status === 'published')
    .sort((a, b) => a.data.display_order - b.data.display_order || a.id.localeCompare(b.id));
  return order.map((category) => ({ category, entries: visible.filter(({ data }) => data.category === category) }))
    .filter(({ entries }) => entries.length > 0);
}
