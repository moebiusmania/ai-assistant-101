import { read, write } from './storage';

/** The mission shown before the learner picks one (and without JavaScript). */
export const DEFAULT_MISSION = 'trip';

const KEY = 'aic:mission';
const DONE_KEY = 'aic:missions';

export function savedMission(): string {
  return read<string>(KEY, DEFAULT_MISSION);
}

export function currentMission(): string {
  return document.documentElement.dataset.mission ?? savedMission();
}

/** Shows only the <Track> blocks of the given mission and tells the other widgets. */
export function showMission(id: string, remember = true): void {
  document.documentElement.dataset.mission = id;
  document.querySelectorAll<HTMLElement>('.track').forEach((t) => (t.hidden = t.dataset.track !== id));
  if (remember) write(KEY, id);
  document.dispatchEvent(new CustomEvent('aic:mission', { detail: id }));
}

export function doneMissions(): string[] {
  return read<string[]>(DONE_KEY, []);
}

export function setMissionDone(id: string, done: boolean): void {
  const list = new Set(doneMissions());
  if (done) list.add(id);
  else list.delete(id);
  write(DONE_KEY, [...list]);
  document.dispatchEvent(new CustomEvent('aic:mission-done', { detail: id }));
}
