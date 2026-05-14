# Estándar de Pruebas Unitarias

## 1. Introducción

Este documento define las prácticas, la nomenclatura estándar y el uso de Jest para la creación y ejecución de pruebas unitarias en el Frontend y Backend.

Nuestro entorno de Integración Continua (CI) en GitHub Actions validará automáticamente que todas las pruebas pasen antes de permitir cualquier _Merge_ a las ramas `main` o `develop`.

## 2. Patrón AAA

Todas las pruebas deben seguir el patrón **AAA (Arrange, Act, Assert)**. Esto mantiene las pruebas legibles y fáciles de depurar.

- **Preparar (Arrange):** Configura los datos de prueba, inicializa variables y define los _mocks_ necesarios.
- **Actuar (Act):** Ejecuta la función o renderiza el componente que se va a probar.
- **Afirmar (Assert):** Verifica que el resultado obtenido sea el esperado.

**Regla de Oro:** Cada prueba debe probar un solo concepto lógico. Evita tener múltiples afirmaciones desconectadas dentro de un mismo bloque `test`.

## 3. Estándar de Nomenclatura

1. **Archivos:** Deben terminar en `.test.ts` o `.test.tsx`.
2. **Bloque `describe`:** Debe llevar el nombre exacto de la clase, función, componente o servicio que se está probando.
3. **Bloque `test` (o `it`):** Debe comenzar siempre con la palabra **"Debería"**, seguida del comportamiento esperado bajo una condición específica.

### Ejemplo de Nomenclatura

```typescript
import { calculatePoints } from '../services/RewardService';

describe('RewardService', () => {
    test('Debería calcular los puntos correctamente cuando el residuo es plástico', () => {
        // Preparar
        const wasteType = 'PLASTIC';

        // Actuar
        const points = calculatePoints(wasteType);

        // Afirmar
        expect(points).toBe(10);
    });

    test('Debería retornar 0 si el tipo de residuo es desconocido', () => {
        // ...
    });
});
```

## 4. Manual Rápido

- **Ejecutar todas las pruebas:**

```bash
npm test
```

- Ejecutar pruebas en modo "watch" :

```bash
npm test -- --watch
```

- Ejecutar un archivo de pruebas específico:

```bash
npm test -- nombre-del-archivo.test.ts
```
