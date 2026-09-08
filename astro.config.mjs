import { defineConfig } from 'astro/config';
import caseSearch from './integrations/case-search';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';

const allowedHosts = (process.env.TAILSCALE_HOSTNAME ?? '')
  .split(',').map((host) => host.trim()).filter(Boolean);

export default defineConfig({
  site: 'https://reymundo-gomez.info',
  output: 'static',
  integrations: [mdx(), icon({ include: { lucide: ['house', 'briefcase-business', 'search', 'badge-check', 'fingerprint', 'book-open', 'mail', 'moon', 'sun', 'arrow-right', 'arrow-up-right', 'external-link', 'lightbulb', 'circle-alert', 'chevron-down', 'pause', 'play', 'circle', 'star', 'code', 'database', 'terminal', 'network', 'chart-no-axes-combined', 'chart-pie', 'hand-heart', 'users', 'landmark', 'bike', 'beer', 'box', 'mountain-snow', 'server', 'puzzle', 'shield-check'] } }), caseSearch()],
  trailingSlash: 'always',
  outDir: process.env.CONTENT_PREVIEW === 'drafts' ? './dist-drafts' : './dist',
  server: { host: '127.0.0.1', port: 4321, allowedHosts },
});
