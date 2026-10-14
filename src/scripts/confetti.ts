/** Fullscreen canvas confetti burst. Respects reduced-motion. */
export function confetti(originEl?: Element): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '999' });
  document.body.append(canvas);
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  const c = canvas.getContext('2d')!;
  c.scale(dpr, dpr);

  const rect = originEl?.getBoundingClientRect();
  const ox = rect ? rect.left + rect.width / 2 : innerWidth / 2;
  const oy = rect ? rect.top + rect.height / 2 : innerHeight / 3;
  const colors = ['#6d5cf0', '#18a999', '#f2a541', '#ef6f5e', '#b693ff'];
  const parts = Array.from({ length: 140 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    return {
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      r: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[(Math.random() * colors.length) | 0],
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
  });

  const start = performance.now();
  function frame(now: number) {
    const t = now - start;
    c.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.28;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      c.save();
      c.globalAlpha = Math.max(0, 1 - t / 2200);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = p.color;
      if (p.shape === 'rect') c.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      else { c.beginPath(); c.arc(0, 0, p.r / 1.5, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    if (t < 2300) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
