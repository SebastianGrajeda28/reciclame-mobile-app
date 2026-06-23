export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic'];
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
/** Límite de tamaño de imagen. Ajustar al límite del clasificador cuando se integre. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

// --- Análisis heurístico de calidad de captura (#215) ---
// Lado al que se reduce la imagen antes de medir. Fijarlo normaliza el resultado
// entre cámaras de distinta resolución y mantiene el cálculo en milisegundos.
export const QUALITY_ANALYSIS_SIZE = 128;
// Varianza del Laplaciano por debajo de la cual la foto se considera borrosa.
// Empírico: conviene mantenerlo permisivo (solo rechaza lo claramente borroso) y
// calibrarlo con los logs de [QUALITY] en __DEV__. La confianza < 0.75 del modelo
// (#195) actúa como segunda red para los borrosos leves que se cuelen.
export const BLUR_LAPLACIAN_VAR_MIN = 60;
// Brillo medio (escala 0-255, absoluta e independiente de la cámara).
export const BRIGHTNESS_MIN = 40; // por debajo => subexpuesta (oscura)
export const BRIGHTNESS_MAX = 220; // por encima => sobreexpuesta (quemada)
// Intentos fallidos consecutivos antes de salir al menú automáticamente (#265).
export const MAX_BAD_CAPTURE_RETRIES = 3;
