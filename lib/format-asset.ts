/** Normalize an XLM decimal as a string. Stellar XLM supports 7 decimals. */
export function normalizeXlmAmount(input: string): string | null {
  const trimmed = input.trim();
  if (!/^\d+(?:\.\d{1,7})?$/.test(trimmed)) return null;

  const [rawWhole, rawFraction = ""] = trimmed.split(".");
  const whole = rawWhole.replace(/^0+(?=\d)/, "");
  const fraction = rawFraction.replace(/0+$/, "");
  const normalized = fraction.length === 0 ? whole : `${whole}.${fraction}`;
  if (/^0(?:\.0*)?$/.test(normalized)) return null;
  return normalized;
}
