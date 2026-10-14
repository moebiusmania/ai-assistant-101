/**
 * Very small text formatter for chat bubbles and examples.
 * Supports: blank-line paragraphs, "- " bullet lists, "1. " numbered lists,
 * **bold**, [placeholders] and `code`. Each word can be wrapped in a span with
 * an index so CSS can "stream" it in, like a real assistant typing.
 */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]/g, '<mark class="ph">[$1]</mark>');
}

export function format(text: string, opts: { stream?: boolean } = {}): string {
  let i = 0;
  const words = (html: string) =>
    opts.stream
      ? html.replace(/(<[^>]+>)|([^\s<]+)/g, (m, tag) => (tag ? m : `<span class="w" style="--i:${i++}">${m}</span>`))
      : html;

  const blocks = text.trim().split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => /^\s*-\s/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${words(inline(l.replace(/^\s*-\s/, '')))}</li>`).join('')}</ul>`;
      }
      if (lines.every((l) => /^\s*\d+\.\s/.test(l))) {
        return `<ol>${lines.map((l) => `<li>${words(inline(l.replace(/^\s*\d+\.\s/, '')))}</li>`).join('')}</ol>`;
      }
      return `<p>${lines.map((l) => words(inline(l))).join('<br>')}</p>`;
    })
    .join('');
}

export function wordCount(html: string): number {
  return (html.match(/class="w"/g) ?? []).length;
}
