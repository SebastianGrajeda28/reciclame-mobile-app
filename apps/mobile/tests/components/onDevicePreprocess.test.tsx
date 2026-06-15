/**
 * Tests de preprocesamiento de imágenes para el clasificador on-device.
 *
 * Pon 4 imágenes reales en tests/fixtures/images/ (JPEG o PNG):
 *   botella.jpg   papel.jpg   pila.jpg   vidrio.jpg   (el nombre no importa)
 *
 * Estos tests verifican que el pipeline produce el tensor correcto
 * (forma y rango de valores) sin necesitar el modelo ni el cel.
 *
 * Para instalar sharp si no está: bun add -d sharp
 */

import path from 'path';
import fs from 'fs';

// Mock expo-image-manipulator usando sharp (Node) en lugar del módulo nativo
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: async (uri: string) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sharp = require('sharp');
    const buf: Buffer = await sharp(uri)
      .resize(224, 224)
      .jpeg({ quality: 95 })
      .toBuffer();
    return { base64: buf.toString('base64'), uri };
  },
  SaveFormat: { JPEG: 'jpeg' },
}));

// Mock react-native-fast-tflite: no se usa en estos tests
jest.mock('react-native-fast-tflite', () => ({
  loadTensorflowModel: jest.fn(),
}));

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'images');

function getFixtureImages(): string[] {
  if (!fs.existsSync(FIXTURES)) return [];
  return fs
    .readdirSync(FIXTURES)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .map((f) => path.join(FIXTURES, f));
}

describe('imageUriToRgbBytes — preprocesamiento', () => {
  const images = getFixtureImages();

  if (images.length === 0) {
    it.todo(
      'No hay imágenes en tests/fixtures/images/. Agrega al menos una para correr estos tests.',
    );
    return;
  }

  images.forEach((imgPath) => {
    it(`Debería producir tensor [224,224,3] uint8 para ${path.basename(imgPath)}`, async () => {
      // importar después del mock para que jest los intercepte
      const { imageUriToRgbBytes } = await import(
        '@/src/features/recycling/services/classification/providers/on-device-waste-classifier'
      );

      const result = await imageUriToRgbBytes(imgPath);

      // Forma: 224 × 224 × 3 canales RGB
      expect(result.byteLength).toBe(224 * 224 * 3);

      // Dtype: uint8 (Uint8Array)
      expect(result).toBeInstanceOf(Uint8Array);

      // Rango de valores: 0-255 (sin normalizar)
      const min = result.reduce((a, b) => Math.min(a, b), 255);
      const max = result.reduce((a, b) => Math.max(a, b), 0);
      expect(min).toBeGreaterThanOrEqual(0);
      expect(max).toBeLessThanOrEqual(255);

      // Sanity: no todos los píxeles pueden ser cero (imagen real)
      expect(max).toBeGreaterThan(0);
    });
  });
});
