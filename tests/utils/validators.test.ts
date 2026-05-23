import { isNonEmptyString } from '../../src/utils/validators';

describe('Utilidades de Validación: isNonEmptyString', () => {
  
  it('debería retornar true si la cadena contiene texto válido', () => {
    expect(isNonEmptyString('hola mundo')).toBe(true);
  });

  it('debería retornar true si la cadena contiene texto pero está rodeada de espacios', () => {
    expect(isNonEmptyString('   texto oculto   ')).toBe(true);
  });

  it('debería retornar false si la cadena está completamente vacía', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('debería retornar false si la cadena contiene únicamente espacios en blanco', () => {
    expect(isNonEmptyString('      ')).toBe(false);
  });

  it('debería retornar false si la cadena contiene saltos de línea o tabulaciones sin texto', () => {
    expect(isNonEmptyString('\n\t  ')).toBe(false);
  });

});
