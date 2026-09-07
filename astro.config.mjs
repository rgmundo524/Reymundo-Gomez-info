import { defineConfig } from 'astro/config';
import caseSearch from './integrations/case-search';

const allowedHosts = (process.env.TAILSCALE_HOSTNAME ?? '')
  .split(',').map((host) => host.trim()).filter(Boolean);

export default defineConfig({
  site: 'https://reymundo-gomez.info',
  output: 'static',
  integrations: [caseSearch()],
  trailingSlash: 'always',
  outDir: process.env.CONTENT_PREVIEW === 'drafts' ? './dist-drafts' : './dist',
  server: { host: '127.0.0.1', port: 4321, allowedHosts },
});
