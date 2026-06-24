// Por debajo de este umbral la predicción se considera "No identificada":
// el modelo no tiene una clase "No soportado" (ver on-device-postprocess), así que
// la confianza baja es la señal para no comprometer una categoría dudosa.
export const RECYCLE_CONFIDENCE_THRESHOLD = 0.75;
export const BIN_TYPE_RESOLUTION_USE_MOCKS = false;

// true = mocks locales  |  false = Supabase
export const RECYCLE_USE_MOCKS = false;
export const RECYCLE_POINTS_USE_MOCKS = false;
