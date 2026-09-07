import { createRequire } from 'node:module';
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { includeDrafts, isVisible } from '../../lib/content';
import { visibleArticles } from '../../lib/articles';
import { caseRoutes } from '../../lib/cases';
import { openGraphKey, previewText } from '../../lib/open-graph';

const require = createRequire(import.meta.url);
const fonts = [400, 700].map((weight) => require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff2`));
const [pageEntries, articleEntries, charts, cases] = await Promise.all([
  getCollection('pages', isVisible), getCollection('articles'), getCollection('charts'), getCollection('cases'),
]);
const pages: Record<string, { title: string; description: string }> = {
  home: { title: 'Site in preparation', description: 'A personal website in preparation.' },
};
for (const { id, data } of pageEntries) pages[id] = { title: data.title, description: data.description_short };
for (const { id, data } of visibleArticles(articleEntries, includeDrafts)) {
  pages[`articles/${id}`] = { title: data.title, description: data.description_short };
}
for (const { chart, category, url } of caseRoutes(charts, cases, includeDrafts)) {
  pages[openGraphKey(url)] = { title: category.label, description: `Explore ${category.label.toLowerCase()} case records in ${chart.data.title.toLowerCase()}.` };
}

const route = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: previewText(page.title, 130),
    description: `${previewText(page.description, 210)}\n\nReymundo Gómez · reymundo-gomez.info`,
    fonts,
    bgGradient: [[20, 35, 52], [39, 48, 63]],
    border: { color: [166, 79, 100], width: 14, side: 'inline-start' },
    padding: 64,
    font: {
      title: { families: ['Inter'], weight: 'Bold', size: page.title.length > 75 ? 48 : 64, lineHeight: 1.1, color: [255, 255, 255] },
      description: { families: ['Inter'], weight: 'Normal', size: 27, lineHeight: 1.3, color: [219, 226, 235] },
    },
  }),
});

export const getStaticPaths = route.getStaticPaths;
export const GET: typeof route.GET = async (context) => {
  const response = await route.GET(context);
  response.headers.set('Content-Type', 'image/png');
  return response;
};
