import {
  BLUR_LAPLACIAN_VAR_MIN,
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  BRIGHT_PIXEL_FRACTION_MAX,
} from './config';
import type { ImageQualityMetrics, ImageQualityResult } from './types';

// Funciones puras (sin decodificación ni nativos) para poder testearlas con
// arrays sintéticos. quality.ts las usa tras decodificar la imagen real.

/**
 * Convierte una imagen RGBA (un byte por canal) a un buffer de luminancia (gris)
 * usando la fórmula estándar de luminosidad.
 * @param rgba - Datos RGBA intercalados (length múltiplo de 4).
 * @returns Float64Array con un valor de gris (0-255) por píxel.
 */
export function rgbaToGrayscale(rgba: ArrayLike<number>): Float64Array {
  const gray = new Float64Array(rgba.length / 4);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 1) {
    gray[j] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  return gray;
}

/**
 * Brillo medio de la imagen en escala 0-255.
 */
export function meanBrightness(gray: ArrayLike<number>): number {
  if (gray.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < gray.length; i += 1) sum += gray[i];
  return sum / gray.length;
}

/**
 * Varianza de la respuesta del filtro Laplaciano (kernel 3×3) sobre la imagen en gris.
 * Un valor alto indica bordes nítidos; uno bajo, una imagen borrosa.
 * @param gray - Luminancia row-major de tamaño width*height.
 */
export function laplacianVariance(
  gray: ArrayLike<number>,
  width: number,
  height: number,
): number {
  if (width < 3 || height < 3) return 0;
  const count = (width - 2) * (height - 2);
  let sum = 0;
  let sumSq = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = y * width + x;
      // Laplaciano:  arriba + abajo + izquierda + derecha - 4*centro
      const lap =
        gray[idx - width] +
        gray[idx + width] +
        gray[idx - 1] +
        gray[idx + 1] -
        4 * gray[idx];
      sum += lap;
      sumSq += lap * lap;
    }
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

/**
 * Fracción de píxeles clavados en sombras (< shadowLevel) y en altas luces
 * (> highlightLevel). A diferencia de la media, detecta siluetas / alto contraste:
 * un sujeto oscuro sobre cielo claro promedia a un valor medio, pero deja una gran
 * fracción de píxeles casi negros (pérdida de detalle en el sujeto).
 * @returns Fracciones en 0-1.
 */
export function pixelFractions(
  gray: ArrayLike<number>,
  shadowLevel: number,
  highlightLevel: number,
): { dark: number; bright: number } {
  if (gray.length === 0) return { dark: 0, bright: 0 };
  let dark = 0;
  let bright = 0;
  for (let i = 0; i < gray.length; i += 1) {
    if (gray[i] < shadowLevel) dark += 1;
    else if (gray[i] > highlightLevel) bright += 1;
  }
  return { dark: dark / gray.length, bright: bright / gray.length };
}

/**
 * Desviación estándar de los píxeles en sombra (< shadowLevel). Distingue una
 * sombra plana/subexpuesta (std baja, sin detalle) de un objeto oscuro con textura
 * (std alta: reflejos, bordes). Devuelve 0 si no hay píxeles oscuros.
 */
export function darkRegionStdDev(gray: ArrayLike<number>, shadowLevel: number): number {
  let count = 0;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < gray.length; i += 1) {
    const v = gray[i];
    if (v < shadowLevel) {
      count += 1;
      sum += v;
      sumSq += v * v;
    }
  }
  if (count === 0) return 0;
  const mean = sum / count;
  return Math.sqrt(Math.max(0, sumSq / count - mean * mean));
}

/**
 * Decide si la imagen es aceptable a partir de sus métricas. Función pura.
 * Exposición (media O fracción de píxeles clavados) antes que desenfoque.
 */
export function evaluateQuality(metrics: ImageQualityMetrics): ImageQualityResult {
  // NOTA: la detección de "oscura por silueta" (fracción de sombra + planitud/std)
  // quedó DESACTIVADA a pedido — daba falsos positivos con objetos negros legítimos.
  // Las métricas darkFraction/darkRegionStdDev se siguen calculando y logueando
  // ([QUALITY]) para calibrar. Para reactivarla, reimporta DARK_PIXEL_FRACTION_MAX y
  // DARK_REGION_STDDEV_MAX de ./config, descomenta esto y súmalo al if de abajo:
  //   const darkSilhouette =
  //     metrics.darkFraction > DARK_PIXEL_FRACTION_MAX &&
  //     metrics.darkRegionStdDev < DARK_REGION_STDDEV_MAX;

  // Oscura: solo por media muy baja (heurística conservadora).
  if (metrics.brightness < BRIGHTNESS_MIN) {
    return { ok: false, reason: 'dark', metrics };
  }
  // Quemada: media muy alta, o gran parte de la imagen en altas luces.
  if (metrics.brightness > BRIGHTNESS_MAX || metrics.brightFraction > BRIGHT_PIXEL_FRACTION_MAX) {
    return { ok: false, reason: 'bright', metrics };
  }
  if (metrics.laplacianVariance < BLUR_LAPLACIAN_VAR_MIN) {
    return { ok: false, reason: 'blur', metrics };
  }
  return { ok: true, metrics };
}
