/**
 * IDR amounts are decimal strings of minor units on the wire (1 rupiah =
 * 1 unit). The UI shows grouped digits and serializes exactly the digits,
 * so no floating-point ever touches a value.
 */

const groupFormatter = new Intl.NumberFormat("id-ID");

/** "1250000" -> "1.250.000" (display only). */
export function formatIdr(amountMinor: string): string {
  const digits = amountMinor.replace(/\D/g, "");
  if (digits.length === 0) return "0";
  return groupFormatter.format(Number(digits));
}

/** Raw typed input -> minor-unit string, or null when there are no digits. */
export function parseIdrInput(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 0) return null;
  return digits.replace(/^0+(?=\d)/, "");
}
