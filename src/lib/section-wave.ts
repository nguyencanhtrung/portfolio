/** Decorative RF carrier and delayed twin; shared by SSR and browser animation. */
export function wavePaths(phase: number) {
  let main = '', echo = '';
  const center = 480 + 24 * Math.sin(phase * .22);
  const amplitude = 22 * (.9 + .1 * Math.cos(phase * .3));
  for (let x = 0; x <= 960; x += 4) {
    const envelope = Math.exp(-Math.pow((x - center) / 175, 2));
    const angle = (x - 480) * Math.PI / 22 - phase;
    const y = 48 + Math.sin(angle) * amplitude * envelope;
    const reflected = 48 - Math.sin(angle - .6) * amplitude * .52 * envelope;
    main += `${x ? 'L' : 'M'}${x} ${y.toFixed(2)} `;
    echo += `${x ? 'L' : 'M'}${x} ${reflected.toFixed(2)} `;
  }
  return { main, echo };
}
