/**
 * Stellar Chain Library - Helper Utilities
 * 
 * Utility functions for Stellar-based chain operations
 */

/**
 * Calculates swap rate and optionally returns inverted rate for display consistency.
 *
 * @param sourceAmount - Amount of asset being swapped FROM
 * @param destAmount - Amount of asset being swapped TO
 * @param options - Optional display settings
 * @returns { rate, invertedRate, formatted }
 */
export function calculateRate(
  sourceAmount: number | string,
  destAmount: number | string,
  options?: {
    invert?: boolean; // If true, returns 1 / rate
    decimals?: number;
  }
) {
  const src = parseFloat(sourceAmount as string);
  const dest = parseFloat(destAmount as string);

  if (!src || src <= 0) return { rate: 0, invertedRate: 0, formatted: "0" };

  const rate = dest / src; // base calculation
  const invertedRate = rate > 0 ? 1 / rate : 0;

  const finalRate = options?.invert ? invertedRate : rate;
  const decimals = options?.decimals ?? 6;

  return {
    rate,
    invertedRate,
    formatted: finalRate.toFixed(decimals),
  };
}

/**
 * Calculates the minimum amount a user should receive after accounting for slippage.
 *
 * @param expectedAmount - The expected amount of tokens to receive (before slippage)
 * @param slippage - The slippage tolerance in percentage (e.g. 0.5 for 0.5%)
 * @returns The minimum amount acceptable after slippage deduction
 */
export function calculateMinReceive(
  expectedAmount: number | string,
  slippage: number
): number {
  const amount =
    typeof expectedAmount === "string"
      ? parseFloat(expectedAmount)
      : expectedAmount;
  const tolerance = slippage / 100; // convert from percentage
  const minReceive = amount * (1 - tolerance);
  return parseFloat(minReceive.toFixed(7)); // keep precision consistent with Stellar 7-decimals
}

/**
 * Convert from token amount to stroops (1 token = 10^7 stroops)
 */
export const toStroops = (tokenAmount: number) => {
  return Math.floor(tokenAmount * 10_000_000);
};

/**
 * Convert from stroops to token amount (1 token = 10^7 stroops)
 */
export const fromStroops = (stroops: number) => {
  return Number(stroops) / 10_000_000;
};
