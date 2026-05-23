import { hasRequiredPermissions } from '../../src/utils/permissions';

describe('Utilidades de Permisos: hasRequiredPermissions', () => {
  
  it('debería retornar false temporalmente (función en construcción)', () => {
    expect(hasRequiredPermissions()).toBe(false);
  });

});
