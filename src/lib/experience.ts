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

// Equal-width calendar months: an end month is inclusive, so June ends at July's boundary.
// Undated roles remain separate instead of being given an invented duration.
export function plotExperience<T extends Position>(entries: T[], asOf = new Date().toISOString().slice(0, 7)) {
  const monthIndex = (value: string) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw new Error(`Invalid timeline month: ${value}`);
    const [year, month] = value.split('-').map(Number);
    return year * 12 + month - 1;
  };
  const present = monthIndex(asOf);
  const ordered = sortExperience(entries, asOf);
  const dated = ordered.filter(({ data }) => data.periods.length > 0);
  const undated = ordered.filter(({ data }) => data.periods.length === 0);
  const periods = dated.flatMap(({ data }) => data.periods);
  const start = Math.floor(Math.min(present, ...periods.map(({ start }) => monthIndex(start))) / 12) * 12;
  const end = Math.max(present + 1, ...periods.map((period) => period.end ? monthIndex(period.end) + 1 : Math.max(present + 1, monthIndex(period.start) + 1)));
  const span = end - start;
  const percentage = (month: number) => (month - start) / span * 100;
  const ticks = [];
  for (let month = start; month < end; month += 12) ticks.push({ year: month / 12, left: percentage(month), alignEnd: month > start && end - month < 6 });
  const rows = dated.map((entry) => ({ entry, periods: [...entry.data.periods]
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((period) => {
      const from = monthIndex(period.start);
      const planned = period.end === null && from > present;
      const to = planned ? from : period.end ? monthIndex(period.end) + 1 : present + 1;
      return { ...period, left: percentage(from), width: (to - from) / span * 100, planned, scheduled: from > present,
        current: from <= present && (period.end === null || monthIndex(period.end) >= present) };
    }) }));
  return { rows, undated, ticks, asOf, present: percentage(present + 1), start, end, span };
}
