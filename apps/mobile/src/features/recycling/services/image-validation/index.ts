import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_IMAGE_BYTES } from './config';
import type { ImageValidationInput, ImageValidationResult } from './types';

function getExtension(value: string): string {
  const clean = value.split('?')[0] ?? '';
  const parts = clean.split('.');
  return (parts[parts.length - 1] ?? '').toLowerCase();
}

export function validateImage(input: ImageValidationInput): ImageValidationResult {
  if (input.mimeType) {
    if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
      return {
        valid: false,
        reason: 'format',
        message: 'Formato no compatible. Usa una imagen JPG, PNG, WEBP o HEIC.',
      };
    }
  } else {
    const ext = getExtension(input.fileName ?? input.uri);
    if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        reason: 'format',
        message: 'Formato no compatible. Usa una imagen JPG, PNG, WEBP o HEIC.',
      };
    }
  }

  if (input.fileSize !== undefined && input.fileSize <= 0) {
    return {
      valid: false,
      reason: 'corrupt',
      message: 'La imagen parece estar dañada. Intenta con otra.',
    };
  }

  if (input.fileSize !== undefined && input.fileSize > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      reason: 'size',
      message: 'La imagen supera el tamaño máximo de 8 MB.',
    };
  }

  if (
    (input.width !== undefined && input.width <= 0) ||
    (input.height !== undefined && input.height <= 0)
  ) {
    return {
      valid: false,
      reason: 'corrupt',
      message: 'La imagen parece estar dañada. Intenta con otra.',
    };
  }

  return { valid: true };
}

// Nota: analyzeImageQuality NO se re-exporta aquí a propósito. Vive en ./quality, que
// importa expo-image-manipulator (nativo) y rompería los tests en bun de quien solo
// necesita validateImage. Impórtalo directo desde './quality'. Los tipos sí son seguros.
export type { ImageValidationInput, ImageValidationResult };
export type { ImageQualityResult, ImageQualityReason, ImageQualityMetrics } from './types';
