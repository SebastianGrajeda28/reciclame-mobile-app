import {
  darkRegionStdDev,
  evaluateQuality,
  laplacianVariance,
  meanBrightness,
  pixelFractions,
  rgbaToGrayscale,
} from '@/src/features/recycling/services/image-validation/quality-math';
import type { ImageQualityMetrics } from '@/src/features/recycling/services/image-validation/types';

// Métricas por defecto (nítida y bien expuesta); cada test sobrescribe lo que le interesa.
// darkRegionStdDev alto por defecto = sombra con textura (no plana).
function metrics(overrides: Partial<ImageQualityMetrics> = {}): ImageQualityMetrics {
  return {
    brightness: 128,
    laplacianVariance: 500,
    darkFraction: 0,
    brightFraction: 0,
    darkRegionStdDev: 40,
    ...overrides,
  };
}

describe('rgbaToGrayscale', () => {
  it('Debería convertir blanco a 255 y negro a 0', () => {
    const gray = rgbaToGrayscale([255, 255, 255, 255, 0, 0, 0, 255]);
    expect(Math.round(gray[0])).toBe(255);
    expect(Math.round(gray[1])).toBe(0);
  });

  it('Debería ponderar el rojo según luminosidad (0.299)', () => {
    const gray = rgbaToGrayscale([255, 0, 0, 255]);
    expect(gray[0]).toBeCloseTo(76.245, 2);
  });
});

describe('meanBrightness', () => {
  it('Debería promediar los valores de gris', () => {
    expect(meanBrightness([0, 255, 0, 255])).toBeCloseTo(127.5, 5);
  });

  it('Debería devolver 0 para un array vacío', () => {
    expect(meanBrightness([])).toBe(0);
  });
});

describe('laplacianVariance', () => {
  it('Debería ser 0 en una imagen uniforme (sin bordes)', () => {
    const flat = new Array(16).fill(100);
    expect(laplacianVariance(flat, 4, 4)).toBe(0);
  });

  it('Debería ser alta en una imagen con bordes fuertes (tablero)', () => {
    // tablero 4x4 de 0/255 → bordes máximos en cada píxel interior
    const checker = [
      0, 255, 0, 255, 255, 0, 255, 0, 0, 255, 0, 255, 255, 0, 255, 0,
    ];
    expect(laplacianVariance(checker, 4, 4)).toBeGreaterThan(1000);
  });

  it('Debería devolver 0 si la imagen es muy pequeña (<3px de lado)', () => {
    expect(laplacianVariance([1, 2, 3, 4], 2, 2)).toBe(0);
  });
});

describe('pixelFractions', () => {
  it('Debería contar todo como sombra si todos los píxeles son negros', () => {
    expect(pixelFractions([0, 0, 0, 0], 35, 225)).toEqual({ dark: 1, bright: 0 });
  });

  it('Debería contar todo como alta luz si todos los píxeles son blancos', () => {
    expect(pixelFractions([255, 255, 255], 35, 225)).toEqual({ dark: 0, bright: 1 });
  });

  it('Debería repartir sombras y altas luces (silueta simplificada)', () => {
    // mitad casi negra, mitad casi blanca
    expect(pixelFractions([0, 0, 255, 255], 35, 225)).toEqual({ dark: 0.5, bright: 0.5 });
  });

  it('Debería devolver 0/0 para un array vacío', () => {
    expect(pixelFractions([], 35, 225)).toEqual({ dark: 0, bright: 0 });
  });
});

describe('darkRegionStdDev', () => {
  it('Debería ser 0 en una sombra plana (todos los oscuros iguales)', () => {
    expect(darkRegionStdDev([0, 0, 0, 0], 35)).toBe(0);
  });

  it('Debería ser alta cuando los píxeles oscuros tienen textura', () => {
    // objeto oscuro con detalle: valores repartidos bajo el nivel de sombra
    expect(darkRegionStdDev([0, 10, 20, 30], 35)).toBeGreaterThan(8);
  });

  it('Debería ignorar los píxeles claros (solo mide la zona oscura)', () => {
    // los 200 se ignoran; solo cuentan 0 y 4 → std pequeña
    expect(darkRegionStdDev([0, 4, 200, 200], 35)).toBeCloseTo(2, 0);
  });

  it('Debería devolver 0 si no hay píxeles oscuros', () => {
    expect(darkRegionStdDev([100, 150, 200], 35)).toBe(0);
  });
});

describe('evaluateQuality', () => {
  it('Debería aceptar una imagen nítida y bien expuesta', () => {
    expect(evaluateQuality(metrics()).ok).toBe(true);
  });

  it('Debería rechazar una imagen oscura por media baja', () => {
    const result = evaluateQuality(metrics({ brightness: 20 }));
    expect(!result.ok && result.reason).toBe('dark');
  });

  it('Ya NO rechaza por silueta: detección oscura-por-fracción desactivada', () => {
    // Aunque la sombra sea grande y plana, con brillo medio OK ahora pasa (no la caza
    // por fracción para no confundir objetos negros legítimos). La media sigue activa.
    const result = evaluateQuality(
      metrics({ brightness: 110, darkFraction: 0.6, darkRegionStdDev: 3 }),
    );
    expect(result.ok).toBe(true);
  });

  it('Debería rechazar una imagen quemada por media alta', () => {
    const result = evaluateQuality(metrics({ brightness: 240 }));
    expect(!result.ok && result.reason).toBe('bright');
  });

  it('Debería rechazar por alta luz clavada aunque la media pase', () => {
    const result = evaluateQuality(metrics({ brightness: 150, brightFraction: 0.6 }));
    expect(!result.ok && result.reason).toBe('bright');
  });

  it('Debería rechazar una imagen borrosa', () => {
    const result = evaluateQuality(metrics({ laplacianVariance: 10 }));
    expect(!result.ok && result.reason).toBe('blur');
  });

  it('Debería priorizar la exposición sobre el desenfoque', () => {
    const result = evaluateQuality(metrics({ brightness: 10, laplacianVariance: 5 }));
    expect(!result.ok && result.reason).toBe('dark');
  });
});
