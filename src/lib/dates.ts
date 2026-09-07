export function formatMonth(value: string): string {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatPeriods(periods: { start: string; end: string | null }[], asOf = new Date().toISOString().slice(0, 7)): string {
  return [...periods].sort((a, b) => a.start.localeCompare(b.start)).map(({ start, end }) => {
    if (start > asOf) return end ? `Scheduled ${formatMonth(start)} to ${formatMonth(end)}` : `Starts ${formatMonth(start)}`;
    return `${formatMonth(start)} to ${end ? formatMonth(end) : 'Present'}`;
  }).join('; ');
}
