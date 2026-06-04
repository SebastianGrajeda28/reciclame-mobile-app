import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';

import labels from '@/assets/model/labels.json';
import { ClassificationPrediction } from '@/src/features/recycling/types/recycling.types';

import { buildPredictionFromOutput } from '@/src/features/recycling/services/classification/providers/on-device-postprocess';
import { WasteClassifier } from '@/src/features/recycling/services/classification/types';

const INPUT_SIZE = 224;

let modelPromise: Promise<TensorflowModel> | undefined;

function getModel(): Promise<TensorflowModel> {
  if (modelPromise) {
    return modelPromise;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const loaded = loadTensorflowModel(require('../../../../../../assets/model/model.tflite'), []);
  modelPromise = loaded;
  return loaded;
}

/**
 * Redimensiona una imagen a 224×224 y la convierte a un buffer RGB uint8
 * listo para alimentar el modelo TFLite (sin normalización — el modelo la tiene embebida).
 * @param uri - URI local de la imagen (file://, data:, content://).
 * @returns Uint8Array de 224×224×3 bytes en orden row-major RGB.
 * @throws Si expo-image-manipulator no puede procesar la imagen o no devuelve base64.
 */
export async function imageUriToRgbBytes(uri: string): Promise<Uint8Array> {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: INPUT_SIZE, height: INPUT_SIZE } }],
    {
      compress: 0.95,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  if (!resized.base64) {
    throw new Error('No se pudo obtener base64 de la imagen redimensionada.');
  }

  const binary = globalThis.atob(resized.base64);
  const jpegBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    jpegBytes[i] = binary.charCodeAt(i);
  }

  const decoded = jpeg.decode(jpegBytes, { useTArray: true });
  const rgba = decoded.data;
  const rgb = new Uint8Array(INPUT_SIZE * INPUT_SIZE * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i];
    rgb[j + 1] = rgba[i + 1];
    rgb[j + 2] = rgba[i + 2];
  }
  return rgb;
}

/**
 * Clasifica un residuo a partir de su imagen usando el modelo TFLite on-device.
 * Carga el modelo una sola vez (singleton) y lo reutiliza en cada llamada.
 * @param imageUri - URI de la imagen capturada (file://, data: o content://).
 * @returns Predicción con wasteTypeId y confianza (0-1).
 * @throws Si el modelo no puede cargarse o la imagen no puede procesarse.
 */
async function classify(imageUri: string): Promise<ClassificationPrediction> {
  const model = await getModel();
  const rgb = await imageUriToRgbBytes(imageUri);
  const inputBuffer = new ArrayBuffer(rgb.byteLength);
  new Uint8Array(inputBuffer).set(rgb);
  const output = await model.run([inputBuffer]);
  return buildPredictionFromOutput(new Float32Array(output[0]), labels as string[]);
}

export const onDeviceWasteClassifier: WasteClassifier = {
  classify,
};
