import type { ReactNode } from "react";

export type ConversionPageConfig = {
  slug: string;
  title: string;
  description: string;
  biasModuleId?: string;
  intro?: ReactNode;
};

export const CONVERSION_PAGES: ConversionPageConfig[] = [
  {
    slug: "rgb-to-hsl",
    title: "RGB to HSL Converter",
    description: "Convert RGB colors to HSL instantly with a live color preview.",
    biasModuleId: "color",
    intro: "Paste any RGB value to see its HSL and other representations with a swatch preview.",
  },
  {
    slug: "rgb-to-hex",
    title: "RGB to Hex Converter",
    description: "Convert RGB colors to Hex instantly with a live color preview.",
    biasModuleId: "color",
    intro: "Drop in RGB values and copy perfect hex codes for CSS or design tokens.",
  },
  {
    slug: "hex-to-rgb",
    title: "Hex to RGB Converter",
    description: "Translate Hex colors to RGB with an immediate swatch preview.",
    biasModuleId: "color",
    intro: "Paste any hex code to grab its RGB and other formats fast.",
  },
  {
    slug: "rgba-to-hsla",
    title: "RGBA to HSLA Converter",
    description: "Translate RGBA colors to HSLA and hex with transparency preserved.",
    biasModuleId: "color",
    intro: "Keep alpha intact while moving between RGBA and HSLA/hex outputs.",
  },
  {
    slug: "rgba-to-hex",
    title: "RGBA to Hex Converter",
    description: "Convert RGBA values to Hex (with alpha) quickly.",
    biasModuleId: "color",
    intro: "Copy 8-digit hex codes from any RGBA input with a live preview.",
  },
  {
    slug: "hex-to-rgba",
    title: "Hex to RGBA Converter",
    description: "Expand hex codes into RGBA with alpha preserved when present.",
    biasModuleId: "color",
    intro: "Paste shorthand or full hex (with or without alpha) and get RGBA plus a swatch.",
  },
  {
    slug: "hsl-to-rgb",
    title: "HSL to RGB Converter",
    description: "Convert HSL or HSLA to RGB instantly with preview.",
    biasModuleId: "color",
    intro: "Turn HSL values into RGB/hex while confirming the color visually.",
  },
  {
    slug: "hsl-to-hex",
    title: "HSL to Hex Converter",
    description: "Transform HSL colors into Hex codes in one paste.",
    biasModuleId: "color",
    intro: "Great for moving from design handoff HSL values to hex tokens.",
  },
  {
    slug: "hex-to-hsl",
    title: "Hex to HSL Converter",
    description: "Convert Hex colors to HSL with immediate feedback.",
    biasModuleId: "color",
    intro: "Paste hex codes to extract HSL values and keep harmony calculations easy.",
  },
  {
    slug: "hsla-to-rgba",
    title: "HSLA to RGBA Converter",
    description: "Swap HSLA colors to RGBA while preserving alpha.",
    biasModuleId: "color",
    intro: "Keep transparency consistent while moving between HSL and RGB worlds.",
  },
  {
    slug: "kg-to-lb",
    title: "Kilograms to Pounds Converter",
    description: "Switch between metric and imperial weight units instantly.",
    biasModuleId: "mass",
    intro: "Quickly convert gym logs or package weights between kg and lb.",
  },
  {
    slug: "lb-to-kg",
    title: "Pounds to Kilograms Converter",
    description: "Convert pounds back to kilograms in one paste.",
    biasModuleId: "mass",
    intro: "Handy for US shipping labels or weight tracking when you need metric values.",
  },
  {
    slug: "jwt-decode",
    title: "Decode JWT Tokens",
    description: "Inspect JWT headers and payloads without verifying signatures.",
    biasModuleId: "jwt",
    intro: "Paste a JWT to view its decoded header and payload. No secrets or verification needed.",
  },
];
