import { createIndex } from 'pagefind';
import { loadContent } from './content';
import { caseSearchRecords } from '../src/lib/search';

export type SearchFile = { path: string; content: Uint8Array };

function checkErrors(errors: string[]) {
  if (errors.length) throw new Error(`Case search: ${errors.join('; ')}`);
}

export async function buildSearchFiles(contentRoot: string, includeDrafts: boolean): Promise<SearchFile[]> {
  const records = caseSearchRecords(await loadContent(contentRoot), includeDrafts);
  if (!records.length) return [];
  const { index, errors } = await createIndex({ forceLanguage: 'en' });
  checkErrors(errors);
  if (!index) throw new Error('Case search: Pagefind could not create an index.');
  try {
    for (const record of records) checkErrors((await index.addCustomRecord(record)).errors);
    const result = await index.getFiles();
    checkErrors(result.errors);
    return result.files;
  } finally {
    await index.deleteIndex();
  }
}

// One build at a time; a change during a build causes a fresh pass before serving.
export function createSearchCache(build: () => Promise<SearchFile[]>) {
  let revision = 0;
  let builtRevision = -1;
  let files = new Map<string, Uint8Array>();
  let pending: Promise<void> | undefined;
  return {
    invalidate() { revision++; },
    async files() {
      while (builtRevision !== revision) {
        if (!pending) pending = (async () => {
          const target = revision;
          const fresh = await build();
          if (target === revision) {
            files = new Map(fresh.map(({ path, content }) => [path, content]));
            builtRevision = target;
          }
        })().finally(() => { pending = undefined; });
        await pending;
      }
      return files;
    },
  };
}
