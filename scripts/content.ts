import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { schemas, relationships, type CollectionName, type ContentRecord } from '../src/content/schemas';

export async function loadContent(root = path.resolve('content')): Promise<ContentRecord[]> {
  const records: ContentRecord[] = [];
  for (const collection of Object.keys(schemas) as CollectionName[]) {
    for (const file of await markdownFiles(path.join(root, collection))) {
      const source = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '');
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      if (!match) throw new Error(`${file}: expected YAML frontmatter enclosed by --- lines.`);
      const document = parseDocument(match[1], { uniqueKeys: true });
      if (document.errors.length) throw new Error(`${file}: ${document.errors.map((error) => error.message).join('; ')}`);
      const parsed = schemas[collection].safeParse(document.toJS());
      if (!parsed.success) {
        throw new Error(`${file}:\n${parsed.error.issues.map((issue) => `  ${issue.path.join('.') || 'frontmatter'}: ${issue.message}`).join('\n')}`);
      }
      const body = source.slice(match[0].length).trim();
      if (!body) throw new Error(`${file}: add the long description below the frontmatter.`);
      records.push({ collection, data: parsed.data, body, file } as ContentRecord);
    }
  }
  validateRecords(records);
  return records;
}

async function markdownFiles(directory: string): Promise<string[]> {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
  const files = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(file);
    return entry.isFile() && entry.name.endsWith('.md') ? [file] : [];
  }));
  return files.flat().sort();
}

export function validateRecords(records: ContentRecord[]): void {
  const index = new Map<string, ContentRecord>();
  for (const record of records) {
    const key = `${record.collection}/${record.data.slug}`;
    if (index.has(key)) throw new Error(`${record.file}: duplicate slug ${key}; also used by ${index.get(key)!.file}.`);
    index.set(key, record);
  }
  for (const record of records) {
    for (const [field, collection] of Object.entries(relationships[record.collection] ?? {})) {
      const value = (record.data as unknown as Record<string, unknown>)[field];
      const ids = typeof value === 'string' ? [value] : value as string[];
      if (new Set(ids).size !== ids.length) throw new Error(`${record.file}: duplicate reference in ${field}.`);
      for (const id of ids) {
        const target = index.get(`${collection}/${id}`);
        if (!target) throw new Error(`${record.file}: ${field} references missing ${collection}/${id}.`);
        if (record.data.publication_status === 'published' && target.data.publication_status !== 'published') {
          throw new Error(`${record.file}: published content references draft ${collection}/${id}. Publish both or remove the reference.`);
        }
      }
    }
  }
}
