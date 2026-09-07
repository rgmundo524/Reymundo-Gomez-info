export function openGraphKey(pathname: string): string {
  return pathname.replace(/^\/+|\/+$/g, '') || 'home';
}

export function openGraphPath(pathname: string): string {
  return `/open-graph/${openGraphKey(pathname)}.png`;
}

export function previewText(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const shortened = text.slice(0, limit - 1);
  const boundary = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, boundary > limit / 2 ? boundary : undefined).trimEnd()}…`;
}
