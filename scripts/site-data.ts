import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const builderRoot = fileURLToPath(new URL('../', import.meta.url));
// Node's native loader preserves values already exported by the shell/devenv.
if (existsSync(path.join(builderRoot, '.env'))) loadEnvFile(path.join(builderRoot, '.env'));

export function resolveSiteData(value = process.env.SITE_DATA_DIR, root = builderRoot) {
  const selected = path.resolve(root, value?.trim() || '.');
  if (!existsSync(selected) || !statSync(selected).isDirectory()) {
    throw new Error(`SITE_DATA_DIR is not a directory: ${selected}`);
  }
  const dataDir = realpathSync(selected);
  const contentDir = path.join(dataDir, 'content');
  if (!existsSync(contentDir) || !statSync(contentDir).isDirectory()) {
    throw new Error(`Missing content directory: ${contentDir}. See docs/external-content.md.`);
  }
  const configFile = path.join(dataDir, 'site.json');
  if (!existsSync(configFile)) throw new Error(`Missing site settings: ${configFile}`);
  const config = JSON.parse(readFileSync(configFile, 'utf8'));
  if (!config || config.version !== 1 || typeof config.url !== 'string'
    || Object.keys(config).some((key) => !['version', 'url'].includes(key))) {
    throw new Error(`${configFile}: expected { "version": 1, "url": "https://your-domain.example" }.`);
  }
  let url: URL;
  try { url = new URL(config.url); }
  catch { throw new Error(`${configFile}: url must be an absolute HTTP(S) website URL.`); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password
    || url.search || url.hash || url.pathname !== '/') {
    throw new Error(`${configFile}: use an HTTP(S) origin without credentials, a path, query, or fragment.`);
  }
  for (const name of ['assets', 'public']) {
    const directory = path.join(dataDir, name);
    if (existsSync(directory) && !statSync(directory).isDirectory()) throw new Error(`Expected a directory: ${directory}`);
  }
  // Different sources must not reuse identical Markdown digests with old file paths.
  const cacheKey = createHash('sha256').update(dataDir).digest('hex').slice(0, 16);
  return { dataDir, contentDir, assetsDir: path.join(dataDir, 'assets'), publicDir: path.join(dataDir, 'public'), url: url.origin, cacheKey };
}
