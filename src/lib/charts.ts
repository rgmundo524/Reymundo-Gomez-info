export type CaseCategory = { id: string; label: string; count: number | null };

// Unknown counts must not be interpreted as zero or normalized away.
export function summarizeCases(categories: CaseCategory[]) {
  const complete = categories.every(({ count }) => count !== null);
  const total = complete ? categories.reduce((sum, { count }) => sum + count!, 0) : null;
  let offset = 0;
  const slices = categories.map((category) => {
    const percentage = total !== null && total > 0 ? category.count! / total * 100 : null;
    const slice = { ...category, percentage, offset };
    offset += percentage ?? 0;
    return slice;
  });
  return { total, slices, canPlot: total !== null && total > 0 };
}

export function formatShare(percentage: number | null): string {
  if (percentage === null) return 'Pending';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(percentage)}%`;
}

export function categoryUrl(chart: string, category: string): string {
  return `/investigations/${chart}/${category}/`;
}

// Filled annular sectors give each link the same hit area as its visible slice.
// Dashed full circles are unsuitable for independent slice links.
export function donutSlicePath(offset: number, percentage: number): string {
  if (percentage <= 0) return '';
  const point = (radius: number, share: number) => {
    const angle = share / 100 * Math.PI * 2 - Math.PI / 2;
    return `${120 + radius * Math.cos(angle)} ${120 + radius * Math.sin(angle)}`;
  };
  const outer = 108;
  const inner = 68;
  if (percentage === 100) {
    return `M ${point(outer, offset)} A ${outer} ${outer} 0 1 1 ${point(outer, offset + 50)} A ${outer} ${outer} 0 1 1 ${point(outer, offset + 100)} L ${point(inner, offset + 100)} A ${inner} ${inner} 0 1 0 ${point(inner, offset + 50)} A ${inner} ${inner} 0 1 0 ${point(inner, offset)} Z`;
  }
  const largeArc = percentage > 50 ? 1 : 0;
  return `M ${point(outer, offset)} A ${outer} ${outer} 0 ${largeArc} 1 ${point(outer, offset + percentage)} L ${point(inner, offset + percentage)} A ${inner} ${inner} 0 ${largeArc} 0 ${point(inner, offset)} Z`;
}
