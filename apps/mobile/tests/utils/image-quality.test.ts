import {
  evaluateQuality,
  laplacianVariance,
  meanBrightness,
  rgbaToGrayscale,
} from '@/src/features/recycling/services/image-validation/quality-math';

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

describe('evaluateQuality', () => {
  it('Debería aceptar una imagen nítida y bien expuesta', () => {
    const result = evaluateQuality({ brightness: 128, laplacianVariance: 500 });
    expect(result.ok).toBe(true);
  });

  it('Debería rechazar una imagen oscura', () => {
    const result = evaluateQuality({ brightness: 20, laplacianVariance: 500 });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toBe('dark');
  });

  it('Debería rechazar una imagen quemada', () => {
    const result = evaluateQuality({ brightness: 240, laplacianVariance: 500 });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toBe('bright');
  });

  it('Debería rechazar una imagen borrosa', () => {
    const result = evaluateQuality({ brightness: 128, laplacianVariance: 10 });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toBe('blur');
  });

  it('Debería priorizar la exposición sobre el desenfoque', () => {
    // oscura Y borrosa → reporta "dark" primero
    const result = evaluateQuality({ brightness: 10, laplacianVariance: 5 });
    expect(!result.ok && result.reason).toBe('dark');
  });
});
