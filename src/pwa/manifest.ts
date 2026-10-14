import { routes, t, url, type Lang } from '../i18n/ui';

/** Web app manifest for one locale. Both share `id` and `scope`, so they describe the same installed app. */
export function manifest(lang: Lang): Response {
  const tr = t(lang);
  const body = {
    id: url('/'),
    name: tr('site.name'),
    short_name: tr('site.name'),
    description: tr('site.tagline'),
    lang,
    dir: 'ltr',
    start_url: routes.home(lang),
    scope: url('/'),
    display: 'standalone',
    background_color: '#faf8f4',
    theme_color: '#faf8f4',
    icons: [
      { src: url('/icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: url('/icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: url('/icons/maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
}
