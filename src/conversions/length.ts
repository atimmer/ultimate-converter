import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";
import { formatFixedTrimmed } from "./formatNumber";

const LENGTH_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>ft\.?|foot\.?|feet\.?|'|in\.?|inch(?:es)?\.?|\"|yd\.?|yds\.?|yard(?:s)?\.?|mi\.?|mile(?:s)?\.?|m\.?|meter(?:s)?\.?|metre(?:s)?\.?|cm\.?|centimeter(?:s)?\.?|centimetre(?:s)?\.?)\s*$/i;

const METERS_PER_FOOT = 0.3048;
const METERS_PER_INCH = 0.0254;
const METERS_PER_YARD = METERS_PER_FOOT * 3;
const METERS_PER_MILE = METERS_PER_FOOT * 5280;
const METERS_PER_CM = 0.01;
const INCHES_PER_FOOT = 12;
const FEET_PER_YARD = 3;
const FEET_PER_MILE = 5280;
const CM_PER_METER = 100;

type NormalizedLength = {
  meters: number;
};

const normalizeSpacing = (raw: string) => raw.replace(/[\u00a0\u202f]/g, " ");

const normalizeUnit = (unit: string) =>
  unit.toLowerCase().replace(/\./g, "").replace(/\s+/g, "").trim();

const detect = (raw: string): Detection | null => {
  const match = normalizeSpacing(raw).trim().match(LENGTH_REGEX);
  if (!match || !match.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unit = normalizeUnit(match.groups.unit);
  let meters: number;

  if (unit === "ft" || unit === "foot" || unit === "feet" || unit === "'") {
    meters = value * METERS_PER_FOOT;
  } else if (
    unit === "in" ||
    unit === "inch" ||
    unit === "inches" ||
    unit === '"'
  ) {
    meters = value * METERS_PER_INCH;
  } else if (
    unit === "yd" ||
    unit === "yds" ||
    unit === "yard" ||
    unit === "yards"
  ) {
    meters = value * METERS_PER_YARD;
  } else if (unit === "mi" || unit === "mile" || unit === "miles") {
    meters = value * METERS_PER_MILE;
  } else if (
    unit === "m" ||
    unit === "meter" ||
    unit === "meters" ||
    unit === "metre" ||
    unit === "metres"
  ) {
    meters = value;
  } else if (
    unit === "cm" ||
    unit === "centimeter" ||
    unit === "centimeters" ||
    unit === "centimetre" ||
    unit === "centimetres"
  ) {
    meters = value * METERS_PER_CM;
  } else {
    return null;
  }

  const normalized: NormalizedLength = {
    meters,
  };

  return {
    score: unit === "m" ? 0.7 : 0.8,
    normalizedInput: normalized,
  };
};

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 100000) return formatFixedTrimmed(value, 0);
  if (abs >= 1000) return formatFixedTrimmed(value, 1);
  if (abs >= 100) return formatFixedTrimmed(value, 2);
  if (abs >= 10) return formatFixedTrimmed(value, 3);
  if (abs >= 1) return formatFixedTrimmed(value, 4);
  if (abs >= 0.1) return formatFixedTrimmed(value, 5);
  return formatFixedTrimmed(value, 6);
};

const toRows = ({ meters }: NormalizedLength): OutputRow[] => {
  const feet = meters / METERS_PER_FOOT;
  const inches = feet * INCHES_PER_FOOT;
  const yards = feet / FEET_PER_YARD;
  const miles = feet / FEET_PER_MILE;
  const centimeters = meters * CM_PER_METER;

  return [
    {
      label: "Feet",
      value: `${format(feet)} ft`,
      copy: feet.toString(),
      hint: "US customary",
    },
    {
      label: "Meters",
      value: `${format(meters)} m`,
      copy: meters.toString(),
      hint: "Metric",
    },
    {
      label: "Centimeters",
      value: `${format(centimeters)} cm`,
      copy: centimeters.toString(),
    },
    {
      label: "Inches",
      value: `${format(inches)} in`,
      copy: inches.toString(),
    },
    {
      label: "Yards",
      value: `${format(yards)} yd`,
      copy: yards.toString(),
    },
    {
      label: "Miles",
      value: `${format(miles)} mi`,
      copy: miles.toString(),
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as NormalizedLength | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const lengthModule: ConversionModule = {
  id: "length",
  label: "Length",
  detect,
  convert,
};

export default lengthModule;
