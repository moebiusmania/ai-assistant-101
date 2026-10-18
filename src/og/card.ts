/**
 * Social share cards (1200×630 PNG), drawn at build time with satori (layout → SVG) and resvg (SVG → PNG).
 * Colours follow public/og-image.png and the certificate.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

const ink = '#1d1a2b';
const muted = '#4b4860';
const violet = '#5b4bdb';
/** The 4D colours used on the certificate (dark enough for white text). */
const dColors = ['#6d5cf0', '#0f7d71', '#a8650d', '#c2412f'];

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
async function loadFonts() {
  const file = (pkg: string, name: string) => readFile(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', name));
  const load = async (name: string, pkg: string, prefix: string, weight: 400 | 600 | 700 | 800) =>
    ['latin', 'latin-ext'].map(async (subset) => ({ name, weight, style: 'normal' as const, data: await file(pkg, `${prefix}-${subset}-${weight}-normal.woff`) }));
  fonts ??= await Promise.all([
    ...(await load('Inter', 'inter', 'inter', 400)),
    ...(await load('Inter', 'inter', 'inter', 600)),
    ...(await load('Inter', 'inter', 'inter', 700)),
    ...(await load('Bricolage', 'bricolage-grotesque', 'bricolage-grotesque', 800)),
  ]);
  return fonts;
}

const brandMark = (size: number): Node => ({
  type: 'svg',
  props: {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    children: [
      { type: 'rect', props: { width: 32, height: 32, rx: 9, fill: violet } },
      { type: 'path', props: { d: 'M9 12.5a3.5 3.5 0 0 1 3.5-3.5h7a3.5 3.5 0 0 1 3.5 3.5v4a3.5 3.5 0 0 1-3.5 3.5H15l-4 3v-3.2A3.5 3.5 0 0 1 9 16.5z', fill: '#fff' } },
      { type: 'circle', props: { cx: 13.5, cy: 14.5, r: 1.3, fill: violet } },
      { type: 'circle', props: { cx: 18.5, cy: 14.5, r: 1.3, fill: violet } },
    ],
  },
});

const pill = (text: string, color: string, bg: string, size = 26): Node =>
  h('div', { display: 'flex', padding: '8px 22px', borderRadius: 999, background: bg, color, fontSize: size, fontWeight: 600 }, text);

/** A small certificate mock-up, shown on the card of the lesson that hands out the certificate. */
const certificate = (title: string, labels: string[]): Node =>
  h(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      width: 400,
      padding: '32px 28px',
      borderRadius: 28,
      background: 'linear-gradient(135deg, #f7f4ff, #eefaf7)',
      border: '3px solid rgba(91,75,219,0.35)',
      boxShadow: '0 30px 60px -20px rgba(60,40,140,0.35)',
      position: 'absolute',
      right: 56,
      top: 200,
      transform: 'rotate(-4deg)',
    },
    h('div', { display: 'flex', color: violet, fontSize: 18, fontWeight: 700, letterSpacing: 1.5 }, title.toUpperCase()),
    h('div', { display: 'flex', width: 260, height: 26, borderRadius: 8, background: 'rgba(29,26,43,0.85)' }),
    h('div', { display: 'flex', width: 200, height: 14, borderRadius: 7, background: 'rgba(75,72,96,0.35)' }),
    h(
      'div',
      { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 },
      ...labels.map((l, i) => h('div', { display: 'flex', padding: '6px 14px', borderRadius: 999, background: dColors[i], color: '#fff', fontSize: 16, fontWeight: 700 }, l)),
    ),
  );

export interface CardProps {
  site: string;
  kicker: string;
  title: string;
  description: string;
  /** Show the certificate mock-up on the right. */
  cert?: { title: string; labels: string[] };
}

export async function renderCard({ site, kicker, title, description, cert }: CardProps): Promise<Buffer> {
  const width = cert ? 540 : 1056;
  const titleSize = title.length > 48 || cert ? 56 : title.length > 32 ? 66 : 76;
  const tree = h(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      height: '100%',
      padding: 72,
      fontFamily: 'Inter',
      color: ink,
      backgroundColor: '#faf8f4',
      backgroundImage:
        'radial-gradient(circle at 92% 8%, rgba(109,92,240,0.2), transparent 45%), radial-gradient(circle at 70% 100%, rgba(242,165,65,0.16), transparent 40%), radial-gradient(circle at 100% 90%, rgba(24,169,153,0.16), transparent 40%)',
    },
    h(
      'div',
      { display: 'flex', flexDirection: 'column', gap: 28, width },
      h('div', { display: 'flex', alignItems: 'center', gap: 18, fontSize: 32, fontWeight: 700 }, brandMark(56), site),
      h('div', { display: 'flex' }, pill(kicker, '#4436b8', '#e9e6fc')),
      h('div', { display: 'flex', fontFamily: 'Bricolage', fontWeight: 800, fontSize: titleSize, lineHeight: 1.05, letterSpacing: -1 }, title),
      h('div', { display: 'block', fontSize: 30, lineHeight: 1.4, color: muted, lineClamp: 3 }, description),
    ),
    cert ? certificate(cert.title, cert.labels) : null,
  );
  const svg = await satori(tree as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: await loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
