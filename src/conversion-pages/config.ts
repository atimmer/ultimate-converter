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
    slug: "rgba-to-hsla",
    title: "RGBA to HSLA Converter",
    description: "Translate RGBA colors to HSLA and hex with transparency preserved.",
    biasModuleId: "color",
    intro: "Keep alpha intact while moving between RGBA and HSLA/hex outputs.",
  },
  {
    slug: "kg-to-lb",
    title: "Kilograms to Pounds Converter",
    description: "Switch between metric and imperial weight units instantly.",
    biasModuleId: "mass",
    intro: "Quickly convert gym logs or package weights between kg and lb.",
  },
  {
    slug: "jwt-decode",
    title: "Decode JWT Tokens",
    description: "Inspect JWT headers and payloads without verifying signatures.",
    biasModuleId: "jwt",
    intro: "Paste a JWT to view its decoded header and payload. No secrets or verification needed.",
  },
];
