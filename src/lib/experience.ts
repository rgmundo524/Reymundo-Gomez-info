type Position = { id: string; data: { display_order?: number; active_position?: boolean; periods: { start: string; end: string | null }[] } };

export function activePosition(periods: Position['data']['periods'], asOf = new Date().toISOString().slice(0, 7)): boolean {
  return periods.some(({ start, end }) => start <= asOf && (end === null || end >= asOf));
}

export function isCurrentPosition(entry: Position, asOf?: string): boolean {
  return entry.data.active_position ?? activePosition(entry.data.periods, asOf);
}

// Explicit priorities first; unnumbered positions fall back to current, then newest.
export function sortExperience<T extends Position>(entries: T[], asOf?: string): T[] {
  const latest = (entry: T) => entry.data.periods.map(({ start }) => start).sort().at(-1) ?? '';
  return [...entries].sort((a, b) => (a.data.display_order ?? Infinity) - (b.data.display_order ?? Infinity)
    || Number(isCurrentPosition(b, asOf)) - Number(isCurrentPosition(a, asOf))
    || latest(b).localeCompare(latest(a)) || a.id.localeCompare(b.id));
}
