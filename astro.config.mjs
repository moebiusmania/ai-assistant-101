// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import pwa from './src/pwa/integration.mjs';

// SITE and BASE are set by the GitHub Pages workflow (from actions/configure-pages),
// so the same build works on a custom domain or under /<repo>/.
export default defineConfig({
  site: process.env.SITE || 'https://example.com',
  base: process.env.BASE || '/',
  integrations: [mdx(), pwa()],
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: { prefixDefaultLocale: false },
  },
});
