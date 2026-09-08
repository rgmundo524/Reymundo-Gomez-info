import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { schemas, type CollectionName } from './content/schemas';
import { loadContent } from '../scripts/content';
import { resolveSiteData } from '../scripts/site-data';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Also validate direct `astro dev` / `astro build` calls, not just npm scripts.
const { contentDir } = resolveSiteData();
const records = await loadContent(contentDir);

function loader(name: CollectionName) {
  // An empty function loader clears old entries. Astro's glob loader otherwise
  // returns early for an empty folder, retaining records from its last build.
  if (!records.some(({ collection }) => collection === name)) return async () => [];
  return glob({
    pattern: '**/*.{md,mdx}', base: pathToFileURL(`${path.join(contentDir, name)}/`),
    generateId: ({ data }) => String(data.slug),
  });
}

export const collections = {
  profile: defineCollection({ loader: loader('profile'), schema: schemas.profile }),
  contacts: defineCollection({ loader: loader('contacts'), schema: schemas.contacts }),
  experience: defineCollection({ loader: loader('experience'), schema: schemas.experience }),
  education: defineCollection({ loader: loader('education'), schema: schemas.education }),
  credentials: defineCollection({ loader: loader('credentials'), schema: schemas.credentials }),
  expertise: defineCollection({ loader: loader('expertise'), schema: schemas.expertise }),
  projects: defineCollection({ loader: loader('projects'), schema: schemas.projects }),
  repositories: defineCollection({ loader: loader('repositories'), schema: schemas.repositories }),
  skills: defineCollection({ loader: loader('skills'), schema: schemas.skills }),
  activities: defineCollection({ loader: loader('activities'), schema: schemas.activities }),
  interests: defineCollection({ loader: loader('interests'), schema: schemas.interests }),
  callouts: defineCollection({ loader: loader('callouts'), schema: schemas.callouts }),
  charts: defineCollection({ loader: loader('charts'), schema: schemas.charts }),
  cases: defineCollection({ loader: loader('cases'), schema: schemas.cases }),
  articles: defineCollection({ loader: loader('articles'), schema: schemas.articles }),
  resources: defineCollection({ loader: loader('resources'), schema: schemas.resources }),
  pages: defineCollection({ loader: loader('pages'), schema: schemas.pages }),
};
