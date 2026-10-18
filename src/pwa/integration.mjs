// @ts-check
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';

/**
 * Font subsets are many and mostly unused: they're cached on first use instead of at install.
 * Share cards (og/) are only fetched by social networks, never by the app.
 */
const SKIP = /\.(woff2?|map)$|^sw\.js$|^og\//;

async function files(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(p)));
    else out.push(p);
  }
  return out;
}

/**
 * Writes dist/sw.js from src/pwa/sw.js with the list of files to precache.
 * The cache version is a hash of those files, so every content change ships a new cache.
 * @returns {import('astro').AstroIntegration}
 */
export default function pwa() {
  let base = '/';
  return {
    name: 'aic-pwa',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const all = (await files(root)).map((p) => relative(root, p).split(sep).join('/')).filter((p) => !SKIP.test(p)).sort();
        const hash = createHash('sha256');
        for (const p of all) hash.update(p).update(await readFile(join(root, p)));
        const urls = all.map((p) => base + p.replace(/(^|\/)index\.html$/, '$1'));
        const template = await readFile(new URL('./sw.js', import.meta.url), 'utf8');
        const sw = template
          .replace('__VERSION__', hash.digest('hex').slice(0, 12))
          .replace('__PRECACHE__', JSON.stringify(urls, null, 2))
          .replace('__BASE__', base);
        await writeFile(join(root, 'sw.js'), sw);
        logger.info(`sw.js: ${urls.length} files precached`);
      },
    },
  };
}
