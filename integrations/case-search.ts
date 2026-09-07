import type { AstroIntegration } from 'astro';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { buildSearchFiles, createSearchCache } from '../scripts/search-index';

export default function caseSearch(): AstroIntegration {
  let contentRoot = path.resolve('content');
  return {
    name: 'case-search',
    hooks: {
      'astro:config:done': ({ config }) => { contentRoot = fileURLToPath(new URL('content/', config.root)); },
      'astro:server:setup': ({ server, logger }) => {
        const cache = createSearchCache(() => buildSearchFiles(contentRoot, true));
        const invalidate = (event: string, filename: string) => {
          const relative = path.relative(contentRoot, path.resolve(filename));
          if (['add', 'change', 'unlink', 'addDir', 'unlinkDir'].includes(event) && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)) cache.invalidate();
        };
        server.watcher.add(contentRoot);
        server.watcher.on('all', invalidate);
        server.httpServer?.once('close', () => server.watcher.off('all', invalidate));
        server.middlewares.use('/pagefind/', async (req, res) => {
          try {
            const key = (req.url ?? '').split('?')[0].replace(/^\//, '');
            const content = (await cache.files()).get(key);
            res.setHeader('Cache-Control', 'no-store');
            if (!content) { res.statusCode = 404; res.end('Search file not found.'); return; }
            const mime: Record<string, string> = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm' };
            res.setHeader('Content-Type', mime[path.extname(key)] ?? 'application/octet-stream');
            res.end(req.method === 'HEAD' ? undefined : Buffer.from(content));
          } catch (error) {
            logger.error(error instanceof Error ? error.message : String(error));
            res.statusCode = 503;
            res.setHeader('Cache-Control', 'no-store');
            res.end('Search is unavailable until the content validation error is corrected.');
          }
        });
      },
      'astro:build:done': async ({ dir, logger }) => {
        const files = await buildSearchFiles(contentRoot, process.env.CONTENT_PREVIEW === 'drafts');
        const output = fileURLToPath(new URL('pagefind/', dir));
        for (const file of files) {
          const destination = path.join(output, file.path);
          await mkdir(path.dirname(destination), { recursive: true });
          await writeFile(destination, file.content);
        }
        logger.info(`Generated ${files.length} case search assets.`);
      },
    },
  };
}
