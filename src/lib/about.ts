export const skillLevels = ['Foundational', 'Developing', 'Proficient', 'Advanced', 'Expert'] as const;

// Stable sorting preserves the page's selection order when values match.
export function orderAboutEntries<T extends { data: { display_order: number } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.data.display_order - b.data.display_order);
}
