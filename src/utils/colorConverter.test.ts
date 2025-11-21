import { describe, expect, test } from "bun:test";

import { convertColorString } from "./colorConverter";

describe("convertColorString output formatting", () => {
  test("formats 8-digit hex without noisy alpha", () => {
    const result = convertColorString("#ff00ff80");

    expect(result?.rgbaString).toBe("rgba(255, 0, 255, 0.5)");
    expect(result?.hex).toBe("#FF00FF80");
  });

  test("normalizes rgb percentages into integers", () => {
    const result = convertColorString("rgb(100%, 50%, 0%)");

    expect(result?.rgbString).toBe("rgb(255, 128, 0)");
    expect(result?.rgbaString).toBe("rgba(255, 128, 0, 1)");
  });

  test("rounds alpha to two decimals for rgba inputs", () => {
    const result = convertColorString("rgba(10, 20, 30, 0.3333)");

    expect(result?.rgbaString).toBe("rgba(10, 20, 30, 0.33)");
    expect(result?.hex).toBe("#0A141E55");
  });
});
