const PAIR_REGEX = /\b([A-Za-z]{3})\s*(?:\/|to|-|\s)\s*([A-Za-z]{3})\b/i;

export type CurrencyPair = {
  base: string;
  quote: string;
};

export const parseCurrencyPair = (raw: string): CurrencyPair | null => {
  const match = raw.trim().toUpperCase().match(PAIR_REGEX);
  if (!match) return null;

  const [, base, quote] = match;
  if (!base || !quote) return null;

  return { base, quote };
};
