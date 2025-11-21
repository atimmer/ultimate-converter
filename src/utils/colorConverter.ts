import { NAMED_COLORS } from "./namedColors";

export type HslInput = {
  h: number;
  s: number;
  l: number;
  a?: number;
};

export type RgbColor = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export type ColorConversionResult = {
  hsl: HslInput;
  rgb: RgbColor;
  rgbString: string;
  rgbaString: string;
  hex: string;
};

const HSL_REGEX =
  /^hsla?\(\s*(?<h>-?\d+(?:\.\d+)?)\s*(?:deg)?\s*,\s*(?<s>\d+(?:\.\d+)?)%\s*,\s*(?<l>\d+(?:\.\d+)?)%\s*(?:,\s*(?<a>-?\d*(?:\.\d+)?%?)\s*)?\)$/i;
const RGB_REGEX =
  /^rgba?\(\s*(?<r>-?\d+(?:\.\d+)?%?)\s*,\s*(?<g>-?\d+(?:\.\d+)?%?)\s*,\s*(?<b>-?\d+(?:\.\d+)?%?)\s*(?:,\s*(?<a>-?\d*(?:\.\d+)?%?)\s*)?\)$/i;
const HEX_REGEX = /^#?(?<value>[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const roundTo = (value: number, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const normalizeHue = (hue: number) => {
  if (!Number.isFinite(hue)) {
    return 0;
  }

  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const channelFromPercent = (value: number) =>
  clamp((value / 100) * 255, 0, 255);

const normalizeHsl = ({ h, s, l, a }: HslInput): HslInput => ({
  h: roundTo(normalizeHue(h)),
  s: roundTo(clamp(s, 0, 100)),
  l: roundTo(clamp(l, 0, 100)),
  a: a === undefined ? undefined : clamp(a, 0, 1),
});

const normalizeRgb = ({ r, g, b, a }: RgbColor): RgbColor => ({
  r: Math.round(clamp(r, 0, 255)),
  g: Math.round(clamp(g, 0, 255)),
  b: Math.round(clamp(b, 0, 255)),
  a: a === undefined ? undefined : clamp(a, 0, 1),
});

const parseAlpha = (alpha: string | undefined) => {
  if (alpha === undefined || alpha === "") {
    return undefined;
  }

  const trimmed = alpha.trim();
  const isPercent = trimmed.endsWith("%");
  const numeric = parseFloat(isPercent ? trimmed.slice(0, -1) : trimmed);

  if (!Number.isFinite(numeric)) {
    return undefined;
  }

  const normalized = isPercent ? numeric / 100 : numeric;
  return clamp(normalized, 0, 1);
};

export function parseHslString(rawInput: string): HslInput | null {
  const input = rawInput.trim();
  const match = input.match(HSL_REGEX);

  if (!match || !match.groups) {
    return null;
  }

  const h = normalizeHue(parseFloat(match.groups.h));
  const s = clamp(parseFloat(match.groups.s), 0, 100);
  const l = clamp(parseFloat(match.groups.l), 0, 100);
  const a = parseAlpha(match.groups.a);

  if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) {
    return null;
  }

  return normalizeHsl({ h, s, l, a });
}

export function parseRgbString(rawInput: string): RgbColor | null {
  const input = rawInput.trim();
  const match = input.match(RGB_REGEX);

  if (!match || !match.groups) {
    return null;
  }

  const parseChannel = (value: string) => {
    const isPercent = value.endsWith("%");
    const numeric = parseFloat(isPercent ? value.slice(0, -1) : value);
    if (!Number.isFinite(numeric)) return null;
    return isPercent ? channelFromPercent(numeric) : clamp(numeric, 0, 255);
  };

  const r = parseChannel(match.groups.r);
  const g = parseChannel(match.groups.g);
  const b = parseChannel(match.groups.b);
  const a = parseAlpha(match.groups.a);

  if (r === null || g === null || b === null) {
    return null;
  }

  return { r, g, b, a };
}

export function parseHexString(rawInput: string): RgbColor | null {
  const input = rawInput.trim();
  const match = input.match(HEX_REGEX);

  if (!match || !match.groups) {
    return null;
  }

  let hex = match.groups.value.toLowerCase();

  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split("")
      .map((char) => char.repeat(2))
      .join("");
  }

  const hasAlpha = hex.length === 8;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hasAlpha
    ? clamp(parseInt(hex.slice(6, 8), 16) / 255, 0, 1)
    : undefined;

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return null;
  }

  return { r, g, b, a };
}

export function parseNamedColor(rawInput: string): RgbColor | null {
  const name = rawInput.trim().toLowerCase();
  const match = NAMED_COLORS[name];

  if (!match) {
    return null;
  }

  const [r, g, b] = match;
  return { r, g, b };
}

export function hslToRgb({ h, s, l, a }: HslInput): RgbColor {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  if (saturation === 0) {
    const gray = Math.round(lightness * 255);
    return { r: gray, g: gray, b: gray, a };
  }

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  const convert = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const r = Math.round(convert(hue + 1 / 3) * 255);
  const g = Math.round(convert(hue) * 255);
  const b = Math.round(convert(hue - 1 / 3) * 255);

  return { r, g, b, a };
}

export function rgbToHsl({ r, g, b, a }: RgbColor): HslInput {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case rn:
        h = 60 * (((gn - bn) / delta) % 6);
        break;
      case gn:
        h = 60 * ((bn - rn) / delta + 2);
        break;
      case bn:
        h = 60 * ((rn - gn) / delta + 4);
        break;
      default:
        break;
    }
  }

  const normalizedHue = normalizeHue(h);
  const saturationPercent = clamp(s * 100, 0, 100);
  const lightnessPercent = clamp(l * 100, 0, 100);

  return normalizeHsl({
    h: normalizedHue,
    s: saturationPercent,
    l: lightnessPercent,
    a,
  });
}

export function rgbToHex({ r, g, b, a }: RgbColor): string {
  const normalized = normalizeRgb({ r, g, b, a });
  const toHex = (value: number) =>
    clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  const base = `${toHex(normalized.r)}${toHex(normalized.g)}${toHex(
    normalized.b,
  )}`;

  if (normalized.a === undefined) {
    return `#${base}`.toUpperCase();
  }

  const alphaHex = toHex(Math.round(clamp(normalized.a, 0, 1) * 255));
  return `#${base}${alphaHex}`.toUpperCase();
}

const formatAlpha = (value: number | undefined) => {
  const normalized = clamp(value ?? 1, 0, 1);
  const rounded = roundTo(normalized, 2);
  const fixed = rounded.toFixed(2);
  return fixed.replace(/\.?0+$/, "");
};

const formatRgbString = (color: RgbColor) => {
  const { r, g, b } = normalizeRgb(color);
  return `rgb(${r}, ${g}, ${b})`;
};

const formatRgbaString = (color: RgbColor) => {
  const normalized = normalizeRgb(color);
  const alpha = formatAlpha(normalized.a);
  return `rgba(${normalized.r}, ${normalized.g}, ${normalized.b}, ${alpha})`;
};

export function convertColorString(
  input: string,
): ColorConversionResult | null {
  if (input.trim().length === 0) {
    return null;
  }

  const fromHsl = parseHslString(input);
  if (fromHsl) {
    const rgb = hslToRgb(fromHsl);
    const normalizedRgb = normalizeRgb(rgb);
    const normalizedHsl = normalizeHsl(fromHsl);

    return {
      hsl: normalizedHsl,
      rgb: normalizedRgb,
      rgbString: formatRgbString(normalizedRgb),
      rgbaString: formatRgbaString(normalizedRgb),
      hex: rgbToHex(normalizedRgb),
    };
  }

  const fromRgb = parseRgbString(input);
  if (fromRgb) {
    const normalizedRgb = normalizeRgb(fromRgb);
    const hsl = rgbToHsl(normalizedRgb);
    return {
      hsl,
      rgb: normalizedRgb,
      rgbString: formatRgbString(normalizedRgb),
      rgbaString: formatRgbaString(normalizedRgb),
      hex: rgbToHex(normalizedRgb),
    };
  }

  const fromHex = parseHexString(input);
  if (fromHex) {
    const normalizedRgb = normalizeRgb(fromHex);
    const hsl = rgbToHsl(normalizedRgb);
    return {
      hsl,
      rgb: normalizedRgb,
      rgbString: formatRgbString(normalizedRgb),
      rgbaString: formatRgbaString(normalizedRgb),
      hex: rgbToHex(normalizedRgb),
    };
  }

  const fromName = parseNamedColor(input);
  if (fromName) {
    const normalizedRgb = normalizeRgb(fromName);
    const hsl = rgbToHsl(normalizedRgb);
    return {
      hsl,
      rgb: normalizedRgb,
      rgbString: formatRgbString(normalizedRgb),
      rgbaString: formatRgbaString(normalizedRgb),
      hex: rgbToHex(normalizedRgb),
    };
  }

  return null;
}

// Backwards compatibility for existing imports
export function convertHslString(input: string): ColorConversionResult | null {
  return convertColorString(input);
}
