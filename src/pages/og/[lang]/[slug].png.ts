import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { renderCard } from '../../../og/card';
import { pick, splitId, t, type Lang } from '../../../i18n/ui';

/** One share card per lesson and language, at /og/<lang>/<slug>.png (see `routes.ogImage`). */
export const getStaticPaths = (async () => {
  const entries = await getCollection('lessons');
  return entries.map((entry) => {
    const { lang, slug } = splitId(entry.id);
    const siblings = entries.filter((e) => splitId(e.id).lang === lang).sort((a, b) => a.data.order - b.data.order);
    return { params: { lang, slug }, props: { entry, lang, siblings } };
  });
}) satisfies GetStaticPaths;

interface Props { entry: CollectionEntry<'lessons'>; lang: Lang; siblings: CollectionEntry<'lessons'>[] }

export const GET: APIRoute<Props> = async ({ props: { entry, lang, siblings } }) => {
  const tr = t(lang);
  const core = siblings.filter((e) => !e.data.optional);
  const n = core.findIndex((e) => e.id === entry.id) + 1;
  const kicker = entry.data.optional ? tr('lesson.bonus') : `${tr('lesson.label')} ${n}/${core.length}`;
  // The lesson that hands out the certificate shows a mock-up of it.
  const cert = entry.body?.includes('<Certificate')
    ? {
        title: tr('cert.title'),
        labels: pick(lang, {
          it: ['Delega', 'Descrizione', 'Discernimento', 'Diligenza'],
          en: ['Delegation', 'Description', 'Discernment', 'Diligence'],
          es: ['Delegación', 'Descripción', 'Discernimiento', 'Diligencia'],
        }),
      }
    : undefined;
  const png = await renderCard({
    site: tr('site.name'),
    kicker: `${kicker} · ${entry.data.minutes} ${tr('lesson.minutes')}`,
    title: entry.data.title,
    description: entry.data.description,
    cert,
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
