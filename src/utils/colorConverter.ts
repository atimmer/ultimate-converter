export type HslInput = {
  h: number
  s: number
  l: number
  a?: number
}

export type RgbColor = {
  r: number
  g: number
  b: number
  a?: number
}

export type ColorConversionResult = {
  hsl: HslInput
  rgb: RgbColor
  rgbString: string
  rgbaString: string
  hex: string
}

const HSL_REGEX = /^hsla?\(\s*(?<h>-?\d+(?:\.\d+)?)\s*(?:deg)?\s*,\s*(?<s>\d+(?:\.\d+)?)%\s*,\s*(?<l>\d+(?:\.\d+)?)%\s*(?:,\s*(?<a>\d*(?:\.\d+)?)\s*)?\)$/i

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const normalizeHue = (hue: number) => {
  if (!Number.isFinite(hue)) {
    return 0
  }

  const normalized = hue % 360
  return normalized < 0 ? normalized + 360 : normalized
}

export function parseHslString(rawInput: string): HslInput | null {
  const input = rawInput.trim()
  const match = input.match(HSL_REGEX)

  if (!match || !match.groups) {
    return null
  }

  const h = normalizeHue(parseFloat(match.groups.h))
  const s = clamp(parseFloat(match.groups.s), 0, 100)
  const l = clamp(parseFloat(match.groups.l), 0, 100)
  const alphaValue = match.groups.a
  const a = alphaValue === undefined || alphaValue === '' ? undefined : clamp(parseFloat(alphaValue), 0, 1)

  if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) {
    return null
  }

  return { h, s, l, a }
}

export function hslToRgb({ h, s, l, a }: HslInput): RgbColor {
  const hue = h / 360
  const saturation = s / 100
  const lightness = l / 100

  if (saturation === 0) {
    const gray = Math.round(lightness * 255)
    return { r: gray, g: gray, b: gray, a }
  }

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation
  const p = 2 * lightness - q

  const convert = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const r = Math.round(convert(hue + 1 / 3) * 255)
  const g = Math.round(convert(hue) * 255)
  const b = Math.round(convert(hue - 1 / 3) * 255)

  return { r, g, b, a }
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export function convertHslString(input: string): ColorConversionResult | null {
  const hsl = parseHslString(input)

  if (!hsl) {
    return null
  }

  const rgb = hslToRgb(hsl)
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const rgbaString = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a ?? 1})`

  return {
    hsl,
    rgb,
    rgbString,
    rgbaString,
    hex: rgbToHex(rgb),
  }
}

