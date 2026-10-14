import { read, write } from './storage';

const KEY = 'aic:progress';

export function completed(): string[] {
  return read<string[]>(KEY, []);
}

export function isDone(slug: string): boolean {
  return completed().includes(slug);
}

export function markDone(slug: string): void {
  const list = new Set(completed());
  list.add(slug);
  write(KEY, [...list]);
}

export function resetProgress(): void {
  write(KEY, []);
}
