import { describe, expect, it } from "bun:test";

import currency from "../currency";

describe("currency module", () => {
  it("detects prefixed symbol amounts", () => {
    const detection = currency.detect("$100");
    expect(detection?.normalizedInput).toEqual({ amount: 100, code: "USD" });
  });

  it("detects suffixed symbol amounts", () => {
    const detection = currency.detect("100€");
    expect(detection?.normalizedInput).toEqual({ amount: 100, code: "EUR" });
  });

  it("detects code with value", () => {
    const detection = currency.detect("250 gbp");
    expect(detection?.normalizedInput).toEqual({ amount: 250, code: "GBP" });
  });

  it("ignores inputs without currency markers", () => {
    expect(currency.detect("100")).toBeNull();
    expect(currency.detect("rgb(255, 0, 0)")).toBeNull();
  });
});
