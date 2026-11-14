import { wavePaths } from '../lib/section-wave';

// Each divider owns only its phase and pause preference. Visibility/media are inputs.
for (const host of document.querySelectorAll<HTMLElement>('[data-section-wave]')) {
  if (host.dataset.waveReady) continue;
  host.dataset.waveReady = 'true';
  const main = host.querySelector<SVGPathElement>('[data-wave-main]');
  const echo = host.querySelector<SVGPathElement>('[data-wave-echo]');
  const toggle = host.querySelector<HTMLButtonElement>('[data-wave-toggle]');
  if (!main || !echo || !toggle) continue;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, lastTime = 0, phase = 0, inView = false, paused = false;
  const canAnimate = () => inView && !document.hidden && !reduced.matches && !paused;
  const draw = (time: number) => {
    frame = 0;
    if (!canAnimate()) return;
    if (!lastTime || time - lastTime >= 32) {
      phase += lastTime ? Math.min((time - lastTime) / 1000, .06) * 2.1 : 0;
      lastTime = time;
      const paths = wavePaths(phase);
      main.setAttribute('d', paths.main);
      echo.setAttribute('d', paths.echo);
    }
    frame = requestAnimationFrame(draw);
  };
  const sync = () => {
    const label = (paused ? toggle.dataset.labelPlay : toggle.dataset.labelPause) ?? '';
    toggle.hidden = reduced.matches;
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.setAttribute('aria-pressed', String(paused));
    if (canAnimate()) {
      if (!frame) frame = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  };
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
  observer.observe(host);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  sync();
}
