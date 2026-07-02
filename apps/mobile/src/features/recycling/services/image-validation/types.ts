export type ImageValidationInput = {
  uri: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
};

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; reason: 'format' | 'size' | 'corrupt'; message: string };

// --- Análisis de calidad de captura (#215) ---
export type ImageQualityReason = 'blur' | 'dark' | 'bright';

export type ImageQualityMetrics = {
  /** Brillo medio en escala 0-255. */
  brightness: number;
  /** Varianza del Laplaciano (mayor = más nítida). */
  laplacianVariance: number;
  /** Fracción de píxeles clavados en sombras (~negro), 0-1. Detecta siluetas. */
  darkFraction: number;
  /** Fracción de píxeles clavados en altas luces (~blanco), 0-1. Detecta quemados. */
  brightFraction: number;
  /**
   * Desviación estándar de los píxeles oscuros. Baja = zona plana/sin detalle
   * (subexpuesta real); alta = textura/bordes (objeto oscuro legítimo).
   */
  darkRegionStdDev: number;
};

export type ImageQualityResult =
  | { ok: true; metrics: ImageQualityMetrics }
  | { ok: false; reason: ImageQualityReason; metrics: ImageQualityMetrics };
