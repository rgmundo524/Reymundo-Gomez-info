type Credential = { id: string; data: { issuer: string; name: string; issued_year: number } };

export function groupCredentials<T extends Credential>(entries: T[]) {
  const groups = new Map<string, { issuer: string; entries: T[] }>();
  for (const entry of entries) {
    const issuer = entry.data.issuer.trim().replace(/\s+/g, ' ');
    const key = issuer.toLocaleLowerCase('en-US');
    const group = groups.get(key) ?? { issuer, entries: [] };
    group.entries.push(entry);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => a.issuer.localeCompare(b.issuer, 'en'))
    .map((group, index) => ({ ...group,
      id: `credential-issuer-${group.issuer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'group'}-${index + 1}`,
      entries: [...group.entries].sort((a, b) => b.data.issued_year - a.data.issued_year
        || a.data.name.localeCompare(b.data.name, 'en') || a.id.localeCompare(b.id)),
    }));
}
