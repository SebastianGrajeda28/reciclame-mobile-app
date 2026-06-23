import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

import { QUALITY_ANALYSIS_SIZE } from './config';
import {
  evaluateQuality,
  laplacianVariance,
  meanBrightness,
  rgbaToGrayscale,
} from './quality-math';
import type { ImageQualityMetrics, ImageQualityResult } from './types';

/**
 * Reduce y decodifica la imagen a luminancia para el análisis.
 * @param uri - URI de la imagen (file://, data:, content://).
 */
async function imageUriToGrayscale(
  uri: string,
): Promise<{ gray: Float64Array; width: number; height: number }> {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: QUALITY_ANALYSIS_SIZE } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );

  if (!resized.base64) {
    throw new Error('No se pudo obtener base64 de la imagen para el análisis.');
  }

  const binary = globalThis.atob(resized.base64);
  const jpegBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) jpegBytes[i] = binary.charCodeAt(i);

  const decoded = jpeg.decode(jpegBytes, { useTArray: true });
  return {
    gray: rgbaToGrayscale(decoded.data),
    width: decoded.width,
    height: decoded.height,
  };
}

/**
 * Análisis heurístico de calidad de una captura (#215): detecta fotos borrosas
 * (varianza del Laplaciano) o mal expuestas (brillo medio). No usa IA: son
 * fórmulas de procesamiento de imagen que corren en milisegundos.
 *
 * @param uri - URI de la imagen capturada o elegida de galería.
 * @returns `{ ok: true }` si es aceptable, o `{ ok: false, reason }` con el motivo.
 */
export async function analyzeImageQuality(uri: string): Promise<ImageQualityResult> {
  const { gray, width, height } = await imageUriToGrayscale(uri);
  const metrics: ImageQualityMetrics = {
    brightness: meanBrightness(gray),
    laplacianVariance: laplacianVariance(gray, width, height),
  };
  const result = evaluateQuality(metrics);

  if (__DEV__) {
    // Log de calibración: anota estos valores con fotos buenas/malas para ajustar
    // BLUR_LAPLACIAN_VAR_MIN en config.ts. No se imprime en producción.
    console.log(
      `[QUALITY] lapVar=${metrics.laplacianVariance.toFixed(1)} brillo=${metrics.brightness.toFixed(0)} → ${
        result.ok ? 'OK' : result.reason
      }`,
    );
  }

  return result;
}
