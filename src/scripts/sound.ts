import { read, write } from './storage';

/**
 * Synthesized sound effects with the Web Audio API.
 * No audio files: every sound is built from oscillators and envelopes.
 *
 * The palette is deliberately low and warm (a soft mallet through a lowpass
 * filter and a small room reverb), and each sound carries a meaning:
 * - tap:    neutral, quiet knock for navigation and toggles
 * - type:   barely-there tick while the assistant "writes"
 * - pop:    something appeared (a rising fourth)
 * - ok:     correct / step forward (a resolved rising fifth)
 * - bad:    not quite (a dull falling semitone)
 * - whoosh: change of view (a deep air sweep)
 * - done:   milestone reached (a full low chord that blooms)
 */
type SoundName = 'tap' | 'pop' | 'ok' | 'bad' | 'done' | 'type' | 'whoosh';

const KEY = 'aic:sound';

type Graph = { ctx: AudioContext; dry: AudioNode; wet: AudioNode };
let graph: Graph | null = null;

export function soundEnabled(): boolean {
  return read<boolean>(KEY, true);
}

export function setSoundEnabled(on: boolean): void {
  write(KEY, on);
  document.dispatchEvent(new CustomEvent('aic:sound', { detail: on }));
}

/** A short, dark room: decaying noise used as a convolution impulse. */
function roomImpulse(ctx: AudioContext, seconds = 1.6): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  return buf;
}

function audio(): Graph | null {
  if (!soundEnabled()) return null;
  try {
    if (!graph) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0.32;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -14;
      limiter.ratio.value = 6;
      master.connect(limiter).connect(ctx.destination);

      const reverb = ctx.createConvolver();
      reverb.buffer = roomImpulse(ctx);
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 1400;
      const wet = ctx.createGain();
      wet.gain.value = 0.28;
      wet.connect(tone).connect(reverb).connect(master);

      graph = { ctx, dry: master, wet };
    }
    if (graph.ctx.state === 'suspended') void graph.ctx.resume();
    return graph;
  } catch {
    return null;
  }
}

/** Sends a node to the dry bus and, optionally, the reverb. */
function route(g: Graph, node: AudioNode, space = 1) {
  node.connect(g.dry);
  if (space > 0) {
    const send = g.ctx.createGain();
    send.gain.value = space;
    node.connect(send).connect(g.wet);
  }
}

/**
 * A warm mallet note: sine fundamental, a soft octave overtone and a sub
 * layer, through a lowpass whose cutoff closes as the note decays.
 */
function note(
  freq: number,
  { start = 0, dur = 0.4, vol = 1, slideTo = 0, bright = 1600, sub = 0.35, space = 1 } = {},
) {
  const g = audio();
  if (!g) return;
  const { ctx } = g;
  const t0 = ctx.currentTime + start;
  const end = t0 + dur;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(bright, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(120, bright * 0.25), end);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  env.gain.exponentialRampToValueAtTime(vol * 0.35, t0 + Math.min(0.12, dur * 0.4));
  env.gain.exponentialRampToValueAtTime(0.0001, end);
  filter.connect(env);
  route(g, env, space);

  const layers: [number, OscillatorType, number][] = [
    [1, 'sine', 1],
    [2, 'triangle', 0.18],
    [0.5, 'sine', sub],
  ];
  for (const [mult, type, level] of layers) {
    if (!level) continue;
    const osc = ctx.createOscillator();
    const lg = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq * mult, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo * mult, end);
    lg.gain.value = level;
    osc.connect(lg).connect(filter);
    osc.start(t0);
    osc.stop(end + 0.05);
  }
}

/** Filtered noise with a moving lowpass, for ticks and sweeps. */
function air(
  { start = 0, dur = 0.4, vol = 0.3, from = 150, peak = 900, space = 1 } = {},
) {
  const g = audio();
  if (!g) return;
  const { ctx } = g;
  const t0 = ctx.currentTime + start;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(peak, t0 + dur * 0.45);
  filter.frequency.exponentialRampToValueAtTime(from, t0 + dur);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.4);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(env);
  route(g, env, space);
  src.start(t0);
}

// Pitches (Hz), kept in the low-middle register.
const C2 = 65.41, C3 = 130.81, D3 = 146.83, G3 = 196.0;
const A3 = 220.0, Bb3 = 233.08, C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.0;

export function play(name: SoundName): void {
  switch (name) {
    case 'tap':
      note(A3, { dur: 0.09, vol: 0.5, slideTo: G3, bright: 900, sub: 0.2, space: 0.3 });
      break;
    case 'type':
      air({ dur: 0.035, vol: 0.05, from: 600 + Math.random() * 300, peak: 1400, space: 0 });
      break;
    case 'pop':
      note(D3, { dur: 0.18, vol: 0.55, bright: 1200 });
      note(G3, { start: 0.07, dur: 0.3, vol: 0.5, bright: 1300 });
      break;
    case 'ok':
      note(C4, { dur: 0.22, vol: 0.55, bright: 1800 });
      note(G4, { start: 0.1, dur: 0.6, vol: 0.55, bright: 2000, sub: 0.45 });
      break;
    case 'bad':
      note(Bb3, { dur: 0.2, vol: 0.5, bright: 700, sub: 0.5 });
      note(A3, { start: 0.14, dur: 0.45, vol: 0.5, slideTo: 210, bright: 500, sub: 0.6, space: 0.6 });
      break;
    case 'whoosh':
      air({ dur: 0.5, vol: 0.32, from: 120, peak: 850 });
      break;
    case 'done':
      note(C2, { dur: 2.2, vol: 0.4, bright: 400, sub: 0, space: 1.2 });
      [C3, G3, C4, E4].forEach((f, i) =>
        note(f, { start: i * 0.11, dur: 1.8 - i * 0.15, vol: 0.42, bright: 1500, sub: i === 0 ? 0.4 : 0, space: 1.3 }),
      );
      note(D4, { start: 0.5, dur: 0.3, vol: 0.12, bright: 1200, sub: 0 });
      note(E4, { start: 0.62, dur: 1.2, vol: 0.2, bright: 1600, sub: 0 });
      break;
  }
}
