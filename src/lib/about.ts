export const skillLevels = ['Foundational', 'Developing', 'Proficient', 'Advanced', 'Expert'] as const;

export function skillLevelLabel(proficiency: number): string {
  if (Number.isInteger(proficiency)) return skillLevels[proficiency - 1];
  return `Between ${skillLevels[Math.floor(proficiency) - 1]} and ${skillLevels[Math.ceil(proficiency) - 1]}`;
}

// Stable sorting preserves the page's selection order when values match.
export function orderAboutEntries<T extends { data: { display_order: number } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.data.display_order - b.data.display_order);
}
