type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Blend `rgb` toward `target` by `ratio` (0 = unchanged, 1 = target). */
export function mix(rgb: Rgb, target: Rgb, ratio: number): Rgb {
  return rgb.map((c, i) => Math.round(c + (target[i]! - c) * ratio)) as Rgb;
}

export const toVar = (rgb: Rgb) => rgb.join(' ');

export function applyBrandColors(primary: string, secondary: string) {
  const root = document.documentElement.style;
  const p = hexToRgb(primary);
  const s = hexToRgb(secondary);
  if (p) {
    root.setProperty('--brand', toVar(p));
    root.setProperty('--brand-dark', toVar(mix(p, [0, 0, 0], 0.18)));
    root.setProperty('--brand-soft', toVar(mix(p, [255, 255, 255], 0.92)));
  }
  if (s) {
    root.setProperty('--accent', toVar(s));
    root.setProperty('--accent-soft', toVar(mix(s, [255, 255, 255], 0.92)));
  }
}
