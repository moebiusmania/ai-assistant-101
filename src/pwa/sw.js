/*
 * Service worker template. src/pwa/integration.mjs fills in the placeholders
 * after the build and writes the result to dist/sw.js.
 * The whole site is precached at install, so the course works offline.
 */
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const FALLBACK = '__BASE__';
const CACHE = `aic-${VERSION}`;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

// Drop caches from previous builds.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('aic-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const keep = (req, res) => {
  // Redirected responses can't be served back for navigations, so don't store them.
  if (res.ok && !res.redirected) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Pages: network first so updates show up; the cached copy (or the home page) when offline.
    e.respondWith(
      fetch(req)
        .then((res) => keep(req, res))
        .catch(async () => (await caches.match(req, { ignoreSearch: true })) ?? caches.match(FALLBACK)),
    );
    return;
  }
  // Assets have content-hashed names: cache first, then network (keeping a copy, e.g. font subsets).
  e.respondWith(caches.match(req).then((hit) => hit ?? fetch(req).then((res) => keep(req, res))));
});
