import { describe, expect, it } from "bun:test";
import massModule from "../mass";

describe("mass module", () => {
  it("detects kg input", () => {
    const detection = massModule.detect("70 kg");
    expect(detection?.normalizedInput).toEqual({ kg: 70 });
  });

  it("detects kg/lb abbreviations with punctuation", () => {
    const kg = massModule.detect("10 kg.")?.normalizedInput as
      | { kg: number }
      | undefined;
    expect(kg?.kg).toBeCloseTo(10, 6);

    const kgs = massModule.detect("10 kgs")?.normalizedInput as
      | { kg: number }
      | undefined;
    expect(kgs?.kg).toBeCloseTo(10, 6);

    const lb = massModule.detect("10 lb.")?.normalizedInput as
      | { kg: number }
      | undefined;
    expect(lb?.kg).toBeCloseTo(10 / 2.20462262, 6);

    const lbs = massModule.detect("10 lbs.")?.normalizedInput as
      | { kg: number }
      | undefined;
    expect(lbs?.kg).toBeCloseTo(10 / 2.20462262, 6);
  });

  it("detects pounds input and normalizes to kg", () => {
    const detection = massModule.detect("220 lb");
    const normalized = detection?.normalizedInput as { kg: number };
    expect(normalized.kg).toBeCloseTo(99.7903, 4);
  });

  it("converts normalized mass to rows", () => {
    const detection = massModule.detect("10 kg");
    if (!detection) throw new Error("Detection failed");
    const payload = massModule.convert(detection, "10 kg");
    expect(payload?.rows[0].label).toBe("Kilograms");
    expect(payload?.rows[1].label).toBe("Pounds");
  });
});
