import { getCollection, getEntry, type CollectionEntry, type CollectionKey } from 'astro:content';
export { activePosition } from './experience';
export { formatMonth, formatPeriods } from './dates';

export const includeDrafts = import.meta.env.DEV || import.meta.env.CONTENT_PREVIEW === 'drafts';

export function isVisible(entry: { data: { publication_status: string } }): boolean {
  return includeDrafts || entry.data.publication_status === 'published';
}

export async function pageProfile(page: CollectionEntry<'pages'> | undefined) {
  if (!page || !isVisible(page)) return undefined;
  const profile = await getEntry('profile', page.data.profile);
  return profile && isVisible(profile) ? profile : undefined;
}

export function contactLink(profile: CollectionEntry<'profile'> | undefined) {
  if (profile?.data.public_email) return { label: 'Email Reymundo', url: `mailto:${profile.data.public_email}` };
  const linkedIn = profile?.data.links.find(({ label }) => label === 'LinkedIn');
  return linkedIn ? { label: 'Connect on LinkedIn', url: linkedIn.url } : undefined;
}

export async function selected<K extends CollectionKey>(collection: K, ids: string[]): Promise<CollectionEntry<K>[]> {
  if (!ids.length) return [];
  const available = await getCollection(collection);
  const entries = ids.map((id) => {
    const entry = available.find((candidate) => candidate.id === id);
    if (!entry) throw new Error(`Page references missing ${collection}/${id}. Run npm run check:content for details.`);
    return entry;
  });
  return entries.filter(isVisible);
}
