function truncateToDecimals(value: number, decimals: number): number {
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);
  const [intPart, decPart = ""] = abs.toFixed(10).split(".");
  const truncatedDec = decPart.slice(0, decimals);
  const result = truncatedDec ? `${intPart}.${truncatedDec}` : intPart;
  return sign * parseFloat(result);
}

/**
 * Formatea un número truncando (no redondeando) a máximo 1-2 decimales,
 * y lo compacta con sufijo k/M para valores grandes.
 *
 * Ejemplos:
 *   13.00000000004 -> "13"
 *   13.175432      -> "13.1"
 *   1200000.234    -> "1.2M"
 *   15400          -> "15.4k"
 */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);

  if (abs >= 1_000_000) {
    return `${truncateToDecimals(value / 1_000_000, 2)}M`;
  }
  if (abs >= 1_000) {
    return `${truncateToDecimals(value / 1_000, 1)}k`;
  }
  return `${truncateToDecimals(value, 1)}`;
}