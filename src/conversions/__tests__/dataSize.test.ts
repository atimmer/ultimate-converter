import { describe, expect, it } from "bun:test";
import dataSizeModule from "../dataSize";

describe("data size module", () => {
  it("detects megabytes input and normalizes to bytes", () => {
    const detection = dataSizeModule.detect("1024mb");
    const normalized = detection?.normalizedInput as { bytes: number };
    expect(normalized.bytes).toBe(1024 * 1024 * 1024);
  });

  it("supports kilobytes input with spacing", () => {
    const detection = dataSizeModule.detect("2048 kb");
    const normalized = detection?.normalizedInput as { bytes: number };
    expect(normalized.bytes).toBe(2048 * 1024);
  });

  it("detects IEC binary unit aliases", () => {
    const kib = dataSizeModule.detect("1 KiB");
    const mib = dataSizeModule.detect("1 MiB");
    const gib = dataSizeModule.detect("1 GiB");
    const tib = dataSizeModule.detect("1 TiB");
    expect(kib?.normalizedInput).toEqual({ bytes: 1024 });
    expect(mib?.normalizedInput).toEqual({ bytes: 1024 ** 2 });
    expect(gib?.normalizedInput).toEqual({ bytes: 1024 ** 3 });
    expect(tib?.normalizedInput).toEqual({ bytes: 1024 ** 4 });
  });

  it("converts normalized data size into rows", () => {
    const detection = dataSizeModule.detect("1024 mb");
    if (!detection) throw new Error("Detection failed");
    const payload = dataSizeModule.convert(detection, "1024 mb");
    expect(payload?.rows.map((row) => row.label)).toEqual([
      "Bytes",
      "Kilobytes",
      "Megabytes",
      "Gigabytes",
      "Terabytes",
    ]);

    const gbRow = payload?.rows.find((row) => row.label === "Gigabytes");
    expect(gbRow?.value.startsWith("1"));
  });
});
