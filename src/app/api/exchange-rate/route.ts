import { NextRequest } from "next/server";

import {
  cacheDurations,
  computeCrossRate,
  getAvailableCurrencies,
  getLatestUsdRates,
} from "../../../lib/currencyApi";
import { parseCurrencyPair } from "../../../utils/currencyPair";

export const revalidate = cacheDurations.dailySeconds;

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  if (!from || !to) {
    return Response.json(
      { error: "Missing query params. Use ?from=USD&to=EUR" },
      { status: 400 },
    );
  }

  const pair = parseCurrencyPair(`${from}/${to}`);
  if (!pair) {
    return Response.json(
      { error: "Invalid currency pair. Use three-letter codes, e.g. ?from=USD&to=EUR." },
      { status: 400 },
    );
  }

  try {
    const [{ currencies }, { rates, asOf }] = await Promise.all([
      getAvailableCurrencies(),
      getLatestUsdRates(),
    ]);

    if (!currencies[pair.base] || !currencies[pair.quote]) {
      return Response.json(
        { error: `Unknown currency code: ${pair.base}/${pair.quote}` },
        { status: 400 },
      );
    }

    const rate = computeCrossRate(pair.base, pair.quote, rates);
    const inverseRate = rate === 0 ? null : 1 / rate;

    return Response.json(
      {
        base: pair.base,
        quote: pair.quote,
        rate,
        inverseRate,
        asOf,
        cachedSeconds: cacheDurations.dailySeconds,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 502 },
    );
  }
}
