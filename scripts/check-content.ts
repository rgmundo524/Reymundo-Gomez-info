import { loadContent } from './content';
import { resolveSiteData } from './site-data';

try {
  const records = await loadContent();
  const drafts = records.filter((record) => record.data.publication_status === 'draft').length;
  console.log(`Content valid: ${records.length} entries (${drafts} drafts) from ${resolveSiteData().contentDir}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
