import { describe, expect, it } from "bun:test";
import timeModule from "../time";

describe("time module", () => {
  it("detects minutes and normalizes to seconds", () => {
    const detection = timeModule.detect("90m");
    if (!detection) throw new Error("Detection failed");
    const normalized = detection.normalizedInput as {
      seconds: number;
      sourceUnit: string;
    };
    expect(normalized.seconds).toBe(90 * 60);
    expect(normalized.sourceUnit).toBe("minute");
  });

  it("detects dotted abbreviations", () => {
    const seconds = timeModule.detect("10 sec.")?.normalizedInput as
      | { seconds: number; sourceUnit: string }
      | undefined;
    expect(seconds?.seconds).toBe(10);
    expect(seconds?.sourceUnit).toBe("second");

    const minutes = timeModule.detect("10 mins.")?.normalizedInput as
      | { seconds: number; sourceUnit: string }
      | undefined;
    expect(minutes?.seconds).toBe(600);
    expect(minutes?.sourceUnit).toBe("minute");

    const hours = timeModule.detect("10 hrs.")?.normalizedInput as
      | { seconds: number; sourceUnit: string }
      | undefined;
    expect(hours?.seconds).toBe(36000);
    expect(hours?.sourceUnit).toBe("hour");

    const months = timeModule.detect("10 mos.")?.normalizedInput as
      | { seconds: number; sourceUnit: string }
      | undefined;
    expect(months?.seconds).toBeCloseTo(10 * 60 * 60 * 24 * 7 * (52 / 12), 6);
    expect(months?.sourceUnit).toBe("month");
  });

  it("renders 90m as 1h30m and 5400 seconds", () => {
    const detection = timeModule.detect("90m");
    if (!detection) throw new Error("Detection failed");
    const payload = timeModule.convert(detection, "90m");
    if (!payload) throw new Error("Convert failed");

    const pretty = payload.rows.find((r) => r.label === "Pretty");
    const seconds = payload.rows.find((r) => r.label === "Seconds");

    expect(pretty?.value).toBe("1h30m");
    expect(seconds?.value).toBe("5400 s");
    expect(seconds?.copy).toBe("5400");
  });

  it("marks month -> week as approximate", () => {
    const detection = timeModule.detect("1 month");
    if (!detection) throw new Error("Detection failed");
    const payload = timeModule.convert(detection, "1 month");
    if (!payload) throw new Error("Convert failed");

    const weeks = payload.rows.find((r) => r.label === "Weeks");
    expect(weeks?.hint ?? "").toContain("Approximate");
  });

  it("marks week -> month as approximate", () => {
    const detection = timeModule.detect("1 week");
    if (!detection) throw new Error("Detection failed");
    const payload = timeModule.convert(detection, "1 week");
    if (!payload) throw new Error("Convert failed");

    const months = payload.rows.find((r) => r.label === "Months");
    expect(months?.hint ?? "").toContain("Approximate");
  });
});
