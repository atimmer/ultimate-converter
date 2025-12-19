import { describe, expect, it } from "bun:test";
import lengthModule from "../length";

describe("length module", () => {
  it("detects common feet spellings and symbols", () => {
    const samples = ["10 feet", "10 foot", "10 ft", "10 ft.", "10'"];
    for (const sample of samples) {
      const detection = lengthModule.detect(sample);
      const normalized = detection?.normalizedInput as
        | { meters: number }
        | undefined;
      expect(normalized?.meters).toBeCloseTo(3.048, 6);
    }
  });

  it("normalizes feet to meters", () => {
    const detection = lengthModule.detect("10 feet");
    const normalized = detection?.normalizedInput as { meters: number };
    expect(normalized.meters).toBeCloseTo(3.048, 6);
  });

  it("detects other common US length units", () => {
    const inches = lengthModule.detect("12 in")?.normalizedInput as
      | { meters: number }
      | undefined;
    expect(inches?.meters).toBeCloseTo(0.3048, 6);

    const inchesSymbol = lengthModule.detect('12"')?.normalizedInput as
      | { meters: number }
      | undefined;
    expect(inchesSymbol?.meters).toBeCloseTo(0.3048, 6);

    const yards = lengthModule.detect("3 yd")?.normalizedInput as
      | { meters: number }
      | undefined;
    expect(yards?.meters).toBeCloseTo(2.7432, 6);

    const mile = lengthModule.detect("1 mile")?.normalizedInput as
      | { meters: number }
      | undefined;
    expect(mile?.meters).toBeCloseTo(1609.344, 6);

    const centimeters = lengthModule.detect("100 cm")?.normalizedInput as
      | { meters: number }
      | undefined;
    expect(centimeters?.meters).toBeCloseTo(1, 6);

    const meters = lengthModule.detect("2 m")?.normalizedInput as
      | { meters: number }
      | undefined;
    expect(meters?.meters).toBeCloseTo(2, 6);
  });

  it("returns rows for common length units", () => {
    const detection = lengthModule.detect("5 ft");
    if (!detection) throw new Error("Detection failed");
    const payload = lengthModule.convert(detection, "5 ft");
    const labels = payload?.rows.map((row) => row.label);
    expect(labels).toEqual([
      "Feet",
      "Meters",
      "Centimeters",
      "Inches",
      "Yards",
      "Miles",
    ]);
  });
});
