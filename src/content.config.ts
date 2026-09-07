import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { schemas, type CollectionName } from './content/schemas';
import { loadContent } from '../scripts/content';

// Also validate direct `astro dev` / `astro build` calls, not just npm scripts.
await loadContent();

function loader(name: CollectionName) {
  return glob({
    pattern: '**/*.{md,mdx}', base: `./content/${name}`,
    generateId: ({ data }) => String(data.slug),
  });
}

export const collections = {
  profile: defineCollection({ loader: loader('profile'), schema: schemas.profile }),
  experience: defineCollection({ loader: loader('experience'), schema: schemas.experience }),
  education: defineCollection({ loader: loader('education'), schema: schemas.education }),
  credentials: defineCollection({ loader: loader('credentials'), schema: schemas.credentials }),
  expertise: defineCollection({ loader: loader('expertise'), schema: schemas.expertise }),
  projects: defineCollection({ loader: loader('projects'), schema: schemas.projects }),
  interests: defineCollection({ loader: loader('interests'), schema: schemas.interests }),
  callouts: defineCollection({ loader: loader('callouts'), schema: schemas.callouts }),
  charts: defineCollection({ loader: loader('charts'), schema: schemas.charts }),
  cases: defineCollection({ loader: loader('cases'), schema: schemas.cases }),
  articles: defineCollection({ loader: loader('articles'), schema: schemas.articles }),
  pages: defineCollection({ loader: loader('pages'), schema: schemas.pages }),
};
