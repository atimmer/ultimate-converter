import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";
import { formatFixedTrimmed } from "./formatNumber";

type NormalizedSpeed = {
  metersPerSecond: number;
};

const SPEED_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>km\s*\/\s*h|kph|kmh|kmph|kilometers?\s+per\s+hour|kilometres?\s+per\s+hour|m\s*\/\s*s|mps|meters?\s+per\s+second|metres?\s+per\s+second|mph|mi\s*\/\s*h|mi\s*\/\s*hr|miles\s+per\s+hour|miles\s*\/\s*hour|miles\s*\/\s*hr)\s*$/i;
const KMH_PER_MPS = 3.6;
const MPH_PER_MPS = 2.2369362921;

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 10000) return formatFixedTrimmed(value, 0);
  if (abs >= 1000) return formatFixedTrimmed(value, 1);
  if (abs >= 100) return formatFixedTrimmed(value, 2);
  if (abs >= 10) return formatFixedTrimmed(value, 3);
  if (abs >= 1) return formatFixedTrimmed(value, 4);
  return formatFixedTrimmed(value, 5);
};

const detect = (raw: string): Detection | null => {
  const match = raw.trim().match(SPEED_REGEX);
  if (!match?.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unit = match.groups.unit
    .toLowerCase()
    .replace(/[\s._-]+/g, "")
    .replace(/\//g, "per");
  let metersPerSecond: number;
  if (
    unit.startsWith("mps") ||
    unit.startsWith("mpers") ||
    unit.startsWith("meterpersecond") ||
    unit.startsWith("meterspersecond") ||
    unit.startsWith("metrepersecond") ||
    unit.startsWith("metrespersecond")
  ) {
    metersPerSecond = value;
  } else if (
    unit.startsWith("kmh") ||
    unit.startsWith("kmph") ||
    unit.startsWith("kph") ||
    unit.startsWith("kmperh") ||
    unit.startsWith("kilometerperhour") ||
    unit.startsWith("kilometersperhour") ||
    unit.startsWith("kilometreperhour") ||
    unit.startsWith("kilometresperhour")
  ) {
    metersPerSecond = value / KMH_PER_MPS;
  } else if (
    unit.startsWith("mph") ||
    unit.startsWith("miperh") ||
    unit.startsWith("miperhr") ||
    unit.startsWith("milesperhour")
  ) {
    metersPerSecond = value / MPH_PER_MPS;
  } else {
    return null;
  }

  return {
    score: 0.81,
    normalizedInput: { metersPerSecond },
  };
};

const toRows = ({ metersPerSecond }: NormalizedSpeed): OutputRow[] => {
  const kilometersPerHour = metersPerSecond * KMH_PER_MPS;
  const milesPerHour = metersPerSecond * MPH_PER_MPS;

  return [
    {
      label: "Meters per second",
      value: `${format(metersPerSecond)} m/s`,
      copy: metersPerSecond.toString(),
      hint: "SI base speed",
    },
    {
      label: "Kilometers per hour",
      value: `${format(kilometersPerHour)} km/h`,
      copy: kilometersPerHour.toString(),
      hint: "Common road speed",
    },
    {
      label: "Miles per hour",
      value: `${format(milesPerHour)} mph`,
      copy: milesPerHour.toString(),
      hint: "US & UK roads, aviation",
    },
  ];
};

const convert = (
  detection: Detection,
  raw: string,
): ConversionPayload | null => {
  if (!raw) return null;
  const normalized = detection.normalizedInput as NormalizedSpeed | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const speedModule: ConversionModule = {
  id: "speed",
  label: "Speed",
  detect,
  convert,
};

export default speedModule;
