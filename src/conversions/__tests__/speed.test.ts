import { describe, expect, it } from "bun:test";
import speedModule from "../speed";

describe("speed module", () => {
  it("detects km/h input and normalizes to m/s", () => {
    const detection = speedModule.detect("36 km/h");
    const normalized = detection?.normalizedInput as {
      metersPerSecond: number;
    };
    expect(normalized.metersPerSecond).toBeCloseTo(10, 5);
  });

  it("detects m/s input", () => {
    const detection = speedModule.detect("5 m/s");
    const normalized = detection?.normalizedInput as {
      metersPerSecond: number;
    };
    expect(normalized.metersPerSecond).toBeCloseTo(5, 5);
  });

  it("detects mph input and normalizes to m/s", () => {
    const detection = speedModule.detect("60 mph");
    const normalized = detection?.normalizedInput as {
      metersPerSecond: number;
    };
    expect(normalized.metersPerSecond).toBeCloseTo(26.8224, 4);
  });

  it("detects spelled-out speed units", () => {
    const metersPerSecond = speedModule.detect("10 meters per second")
      ?.normalizedInput as { metersPerSecond: number } | undefined;
    expect(metersPerSecond?.metersPerSecond).toBeCloseTo(10, 6);

    const milesPerHour = speedModule.detect("55 miles per hour")
      ?.normalizedInput as { metersPerSecond: number } | undefined;
    expect(milesPerHour?.metersPerSecond).toBeCloseTo(55 / 2.2369362921, 6);

    const kilometersPerHour = speedModule.detect("88 kilometers per hour")
      ?.normalizedInput as { metersPerSecond: number } | undefined;
    expect(kilometersPerHour?.metersPerSecond).toBeCloseTo(88 / 3.6, 6);

    const milesPerHourSlash = speedModule.detect("60 mi/hr")
      ?.normalizedInput as { metersPerSecond: number } | undefined;
    expect(milesPerHourSlash?.metersPerSecond).toBeCloseTo(
      60 / 2.2369362921,
      6,
    );
  });

  it("converts normalized speed to rows", () => {
    const detection = speedModule.detect("10 m/s");
    if (!detection) throw new Error("Detection failed");
    const payload = speedModule.convert(detection, "10 m/s");
    expect(payload?.rows[0].label).toBe("Meters per second");
    expect(payload?.rows[1].label).toBe("Kilometers per hour");
    expect(payload?.rows[2].label).toBe("Miles per hour");
  });
});
