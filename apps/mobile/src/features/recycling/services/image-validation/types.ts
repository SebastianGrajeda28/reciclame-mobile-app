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
};

export type ImageQualityResult =
  | { ok: true; metrics: ImageQualityMetrics }
  | { ok: false; reason: ImageQualityReason; metrics: ImageQualityMetrics };
