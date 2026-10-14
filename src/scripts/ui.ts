/** Reads the localized UI strings a widget was rendered with. */
export function strings(el: HTMLElement): Record<string, string> {
  try {
    return JSON.parse(el.dataset.i18n ?? '{}');
  } catch {
    return {};
  }
}

export function data<T>(el: HTMLElement, key = 'config'): T {
  return JSON.parse(el.dataset[key] ?? 'null') as T;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
