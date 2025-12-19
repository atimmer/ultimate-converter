import { describe, expect, it } from "bun:test";
import volumeModule from "../volume";

describe("volume module", () => {
  it("detects liters input", () => {
    const detection = volumeModule.detect("2 L");
    expect(detection?.normalizedInput).toEqual({ liters: 2 });
  });

  it("detects milliliters input and normalizes to liters", () => {
    const detection = volumeModule.detect("750 ml");
    const normalized = detection?.normalizedInput as { liters: number };
    expect(normalized.liters).toBeCloseTo(0.75, 8);
  });

  it("detects cubic meters input and normalizes to liters", () => {
    const detection = volumeModule.detect("1.5 m^3");
    const normalized = detection?.normalizedInput as { liters: number };
    expect(normalized.liters).toBeCloseTo(1500, 8);
  });

  it("detects US gallons input and normalizes to liters", () => {
    const detection = volumeModule.detect("1 gal");
    const normalized = detection?.normalizedInput as { liters: number };
    expect(normalized.liters).toBeCloseTo(3.785411784, 10);
  });

  it("detects common US volume abbreviations", () => {
    const gallon = volumeModule.detect("1 gals")?.normalizedInput as
      | { liters: number }
      | undefined;
    expect(gallon?.liters).toBeCloseTo(3.785411784, 12);

    const quart = volumeModule.detect("1 qts")?.normalizedInput as
      | { liters: number }
      | undefined;
    expect(quart?.liters).toBeCloseTo(0.946352946, 12);

    const pint = volumeModule.detect("1 pts")?.normalizedInput as
      | { liters: number }
      | undefined;
    expect(pint?.liters).toBeCloseTo(0.473176473, 12);

    const flOz = volumeModule.detect("1 fl. oz.")?.normalizedInput as
      | { liters: number }
      | undefined;
    expect(flOz?.liters).toBeCloseTo(0.0295735295625, 12);

    const fluidOz = volumeModule.detect("1 fluid oz")?.normalizedInput as
      | { liters: number }
      | undefined;
    expect(fluidOz?.liters).toBeCloseTo(0.0295735295625, 12);

    const tbsp = volumeModule.detect("1 tbsp.")?.normalizedInput as
      | { liters: number }
      | undefined;
    expect(tbsp?.liters).toBeCloseTo(0.01478676478125, 12);

    const tbs = volumeModule.detect("1 tbs")?.normalizedInput as
      | { liters: number }
      | undefined;
    expect(tbs?.liters).toBeCloseTo(0.01478676478125, 12);

    const tbl = volumeModule.detect("1 tbl.")?.normalizedInput as
      | { liters: number }
      | undefined;
    expect(tbl?.liters).toBeCloseTo(0.01478676478125, 12);

    const tsp = volumeModule.detect("1 tsp.")?.normalizedInput as
      | { liters: number }
      | undefined;
    expect(tsp?.liters).toBeCloseTo(0.00492892159375, 12);
  });

  it("converts normalized volume to rows", () => {
    const detection = volumeModule.detect("1 L");
    if (!detection) throw new Error("Detection failed");
    const payload = volumeModule.convert(detection, "1 L");
    expect(payload?.rows[0].label).toBe("Liters");
    expect(payload?.rows.some((r) => r.label === "US gallons")).toBe(true);
  });
});
