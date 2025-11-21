import type { ReactNode } from "react";

export type ConversionPageConfig = {
  slug: string;
  title: string;
  description: string;
  biasModuleId?: string;
};

export const CONVERSION_PAGES: ConversionPageConfig[] = [
  {
    slug: "rgb-to-hsl",
    title: "RGB to HSL Converter",
    description: "Convert RGB colors to HSL instantly with a live color preview.",
    biasModuleId: "color",
  },
  {
    slug: "rgb-to-hex",
    title: "RGB to Hex Converter",
    description: "Convert RGB colors to Hex instantly with a live color preview.",
    biasModuleId: "color",
  },
  {
    slug: "hex-to-rgb",
    title: "Hex to RGB Converter",
    description: "Translate Hex colors to RGB with an immediate swatch preview.",
    biasModuleId: "color",
  },
  {
    slug: "rgba-to-hsla",
    title: "RGBA to HSLA Converter",
    description: "Translate RGBA colors to HSLA and hex with transparency preserved.",
    biasModuleId: "color",
  },
  {
    slug: "rgba-to-hex",
    title: "RGBA to Hex Converter",
    description: "Convert RGBA values to Hex (with alpha) quickly.",
    biasModuleId: "color",
  },
  {
    slug: "hex-to-rgba",
    title: "Hex to RGBA Converter",
    description: "Expand hex codes into RGBA with alpha preserved when present.",
    biasModuleId: "color",
  },
  {
    slug: "hsl-to-rgb",
    title: "HSL to RGB Converter",
    description: "Convert HSL or HSLA to RGB instantly with preview.",
    biasModuleId: "color",
  },
  {
    slug: "hsl-to-hex",
    title: "HSL to Hex Converter",
    description: "Transform HSL colors into Hex codes in one paste.",
    biasModuleId: "color",
  },
  {
    slug: "hex-to-hsl",
    title: "Hex to HSL Converter",
    description: "Convert Hex colors to HSL with immediate feedback.",
    biasModuleId: "color",
  },
  {
    slug: "hsla-to-rgba",
    title: "HSLA to RGBA Converter",
    description: "Swap HSLA colors to RGBA while preserving alpha.",
    biasModuleId: "color",
  },
  {
    slug: "kg-to-lb",
    title: "Kilograms to Pounds Converter",
    description: "Switch between metric and imperial weight units instantly.",
    biasModuleId: "mass",
  },
  {
    slug: "lb-to-kg",
    title: "Pounds to Kilograms Converter",
    description: "Convert pounds back to kilograms in one paste.",
    biasModuleId: "mass",
  },
  {
    slug: "jwt-decode",
    title: "Decode JWT Tokens",
    description: "Inspect JWT headers and payloads without verifying signatures.",
    biasModuleId: "jwt",
  },
];
