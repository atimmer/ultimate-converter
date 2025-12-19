import { describe, expect, it } from "bun:test";
import rainRateModule from "../rainRate";

describe("rain-rate module", () => {
  it("detects dBZ input and converts to mm/h", () => {
    const detection = rainRateModule.detect("40 dBZ");
    const normalized = detection?.normalizedInput as {
      millimetersPerHour: number;
      dbz: number;
    };

    expect(normalized.dbz).toBeCloseTo(40, 8);
    expect(normalized.millimetersPerHour).toBeCloseTo(11.53, 2);
  });

  it("detects mm/h input and converts to dBZ", () => {
    const detection = rainRateModule.detect("10 mm/h");
    const normalized = detection?.normalizedInput as {
      millimetersPerHour: number;
      dbz: number;
    };

    expect(normalized.millimetersPerHour).toBeCloseTo(10, 8);
    expect(normalized.dbz).toBeCloseTo(39.01, 2);
  });

  it("supports mm/hr aliases", () => {
    const detection = rainRateModule.detect("10 mm/hr");
    const normalized = detection?.normalizedInput as {
      millimetersPerHour: number;
      dbz: number;
    };
    expect(normalized.millimetersPerHour).toBeCloseTo(10, 8);
    expect(normalized.dbz).toBeCloseTo(39.01, 2);
  });

  it("renders output rows", () => {
    const detection = rainRateModule.detect("35 dbz");
    if (!detection) throw new Error("Detection failed");

    const payload = rainRateModule.convert(detection, "35 dbz");
    expect(payload?.rows[0].label).toBe("Rain rate");
    expect(payload?.rows[1].label).toBe("Radar reflectivity");
  });
});
