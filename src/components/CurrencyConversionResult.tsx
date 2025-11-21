"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

const TARGETS = ["USD", "EUR", "GBP", "JPY", "AUD"];

type Props = {
  amount: number;
  currencyCode: string;
};

type ApiResponse = {
  base: string;
  quote: string;
  rate: number;
  inverseRate: number | null;
  asOf?: string;
  error?: string;
};

const fetchRate = async (from: string, to: string): Promise<ApiResponse> => {
  const response = await fetch(`/api/exchange-rate?from=${from}&to=${to}`, {
    next: { revalidate: 60 * 60 * 24 },
  });
  const payload = (await response.json()) as ApiResponse;
  if (!response.ok || payload.error || typeof payload.rate !== "number") {
    throw new Error(payload.error ?? "Failed to fetch rate");
  }
  return payload;
};

const formatAmount = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 6,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(6)} ${currency}`;
  }
};

const formatRate = (rate: number) => {
  const rounded = Number(rate.toFixed(8));
  return rounded.toString();
};

export default function CurrencyConversionResult({ amount, currencyCode }: Props) {
  const uppercase = currencyCode.toUpperCase();
  const targets = useMemo(
    () => TARGETS.filter((target) => target !== uppercase),
    [uppercase],
  );

  const queries = useQueries({
    queries: targets.map((target) => ({
      queryKey: ["currency-rate", uppercase, target],
      queryFn: () => fetchRate(uppercase, target),
    })),
  });

  const anyLoading = queries.some((q) => q.isLoading);
  const anyError = queries.find((q) => q.error);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">
          {formatAmount(amount, uppercase)}
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          {uppercase}
        </span>
      </div>

      {anyLoading ? (
        <p className="text-sm text-slate-500">Fetching daily rates…</p>
      ) : anyError ? (
        <p className="text-sm text-rose-600">
          {anyError instanceof Error ? anyError.message : "Could not load rates."}
        </p>
      ) : (
        <div className="space-y-2">
          {queries.map((query, index) => {
            if (!query.data) return null;
            const converted = Number((amount * query.data.rate).toFixed(6));
            return (
              <div
                key={query.data.quote ?? targets[index]}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {formatAmount(converted, query.data.quote)}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                    {query.data.base} → {query.data.quote} (rate {formatRate(query.data.rate)})
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {query.data.asOf ? `As of ${new Date(query.data.asOf).toUTCString()}` : "Daily"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
