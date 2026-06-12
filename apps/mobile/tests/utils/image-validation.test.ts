import { validateImage } from '@/src/features/recycling/services/image-validation';

describe('validateImage', () => {
  it('Debería aceptar una imagen JPG dentro del tamaño permitido', () => {
    const result = validateImage({
      uri: 'file:///photo.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1 * 1024 * 1024,
      width: 1920,
      height: 1080,
    });
    expect(result.valid).toBe(true);
  });

  it('Debería rechazar un formato no soportado (gif)', () => {
    const result = validateImage({
      uri: 'file:///anim.gif',
      mimeType: 'image/gif',
      fileSize: 500 * 1024,
      width: 200,
      height: 200,
    });
    expect(result.valid).toBe(false);
    expect(!result.valid && result.reason).toBe('format');
  });

  it('Debería rechazar una imagen que excede el tamaño máximo', () => {
    const result = validateImage({
      uri: 'file:///large.jpg',
      mimeType: 'image/jpeg',
      fileSize: 10 * 1024 * 1024,
      width: 4000,
      height: 3000,
    });
    expect(result.valid).toBe(false);
    expect(!result.valid && result.reason).toBe('size');
  });

  it('Debería rechazar una imagen corrupta (dimensiones 0)', () => {
    const result = validateImage({
      uri: 'file:///corrupt.jpg',
      mimeType: 'image/jpeg',
      fileSize: 500 * 1024,
      width: 0,
      height: 0,
    });
    expect(result.valid).toBe(false);
    expect(!result.valid && result.reason).toBe('corrupt');
  });

  it('Debería rechazar un archivo vacío (fileSize 0)', () => {
    const result = validateImage({
      uri: 'file:///empty.jpg',
      mimeType: 'image/jpeg',
      fileSize: 0,
      width: 800,
      height: 600,
    });
    expect(result.valid).toBe(false);
    expect(!result.valid && result.reason).toBe('corrupt');
  });

  it('Debería aceptar imagen sin mimeType si la extensión es válida', () => {
    const result = validateImage({
      uri: 'file:///foto.png',
      width: 800,
      height: 600,
    });
    expect(result.valid).toBe(true);
  });

  it('Debería rechazar imagen sin mimeType con extensión inválida', () => {
    const result = validateImage({
      uri: 'file:///documento.pdf',
      width: 800,
      height: 600,
    });
    expect(result.valid).toBe(false);
    expect(!result.valid && result.reason).toBe('format');
  });
});
