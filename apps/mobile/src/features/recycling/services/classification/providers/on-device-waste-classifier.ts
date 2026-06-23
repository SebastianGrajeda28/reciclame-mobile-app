import { Asset } from 'expo-asset';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';

import labels from '@/assets/model/labels.json';
import { ClassificationPrediction } from '@/src/features/recycling/types/recycling.types';

import { buildPredictionFromOutput } from '@/src/features/recycling/services/classification/providers/on-device-postprocess';
import { WasteClassifier } from '@/src/features/recycling/services/classification/types';

const INPUT_SIZE = 224;

let modelPromise: Promise<TensorflowModel> | undefined;

/**
 * Carga el modelo TFLite (una sola vez — singleton).
 *
 * `react-native-fast-tflite` carga el modelo internamente con
 * `new URL(uri).openStream()` (Java), que solo entiende:
 *  - rutas reales del sistema de archivos (`file:///data/...`)
 *  - URLs `http(s)://`
 *
 * NO entiende `file:///android_asset/...` (eso requiere AssetManager de Android,
 * no java.net.URL) — por eso esa variante falla con FileNotFoundException.
 *
 * Solución: usar `expo-asset` para copiar el modelo empaquetado a un archivo
 * real dentro del almacenamiento de la app (`Asset.downloadAsync()` rellena
 * `localUri` con un `file://...` real), y pasar esa ruta a `loadTensorflowModel`.
 */
function getModel(): Promise<TensorflowModel> {
  if (modelPromise) {
    console.log('🔥 TFLITE: usando modelo ya cargado (cache)');
    return modelPromise;
  }
  console.log('🔥 TFLITE: iniciando carga de asset...');
  const loaded = (async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const asset = Asset.fromModule(require('../../../../../../assets/model/model.tflite'));
    await asset.downloadAsync();

    const uri = asset.localUri ?? asset.uri;
    console.log('🔥 TFLITE: asset listo, localUri =', asset.localUri, ' uri =', asset.uri);

    if (!uri) {
      throw new Error('No se pudo resolver la URI del modelo TFLite.');
    }

    return loadTensorflowModel({ url: uri }, []);
  })();

  loaded
    .then(() => console.log('🔥 TFLITE: modelo cargado OK'))
    .catch((e) => console.log('🔥 TFLITE: ERROR cargando modelo:', String(e)));
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
  let t = Date.now();

  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: INPUT_SIZE, height: INPUT_SIZE } }],
    {
      // La calidad JPEG es irrelevante para clasificar a 224px: bajar el compress
      // reduce el tamaño que jpeg.decode tiene que procesar.
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );
  console.log('🔥 manipulate ms =', Date.now() - t);
  t = Date.now();

  if (!resized.base64) {
    throw new Error('No se pudo obtener base64 de la imagen redimensionada.');
  }

  const binary = globalThis.atob(resized.base64);
  const jpegBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    jpegBytes[i] = binary.charCodeAt(i);
  }
  console.log('🔥 atob ms =', Date.now() - t);
  t = Date.now();

  const decoded = jpeg.decode(jpegBytes, { useTArray: true });
  console.log('🔥 jpeg.decode ms =', Date.now() - t);

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
 *
 * Usa un candado `inFlight` para evitar clasificaciones concurrentes: si llega
 * una segunda llamada mientras otra está en curso, reutiliza la misma promesa
 * en lugar de lanzar otra conversión pesada (que podía colgar la app por memoria).
 *
 * @param imageUri - URI de la imagen capturada (idealmente `file://`, NO un `data:` gigante).
 * @returns Predicción con wasteTypeId y confianza (0-1).
 * @throws Si el modelo no puede cargarse o la imagen no puede procesarse.
 */
let inFlight: Promise<ClassificationPrediction> | null = null;

async function classify(imageUri: string): Promise<ClassificationPrediction> {
  if (inFlight) {
    console.log('🔥 TFLITE: ya hay una clasificación en curso, reutilizando');
    return inFlight;
  }

  inFlight = (async () => {
    const t0 = Date.now();
    console.log('🔥 TFLITE: classify() iniciado, uri =', imageUri.slice(0, 40), '...');

    const model = await getModel();

    const rgb = await imageUriToRgbBytes(imageUri);
    console.log('🔥 TFLITE: imagen convertida, bytes =', rgb.byteLength);

    const output = await model.run([rgb.buffer as ArrayBuffer]);

    const prediction = buildPredictionFromOutput(
      new Float32Array(output[0]),
      labels as string[],
    );
    console.log(
      '🔥 TFLITE: predicción =',
      JSON.stringify(prediction),
      '| total ms =',
      Date.now() - t0,
    );
    return prediction;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export const onDeviceWasteClassifier: WasteClassifier = {
  classify,
};