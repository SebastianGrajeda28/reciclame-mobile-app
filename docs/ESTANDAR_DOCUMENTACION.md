# Estándar de Documentación

## 1. Introducción

Este documento define los lineamientos para documentar el código. Se priorizará la claridad en los módulos principales y la lógica de negocio compleja.

## 2. Herramientas de Documentación

Para mantener la consistencia entre el Frontend y el Backend, se utilizará las siguientes herramientas:

- **TSDoc:** Para documentar la lógica de negocio, servicios, utilidades y hooks principales tanto en el cliente como en el servidor.
- **Storybook:** Para el catálogo y documentación visual de los componentes de interfaz de usuario (UI) principales en React Native.

## 3. Alcance: ¿Qué se debe documentar obligatoriamente?

**NO** es necesario documentar cada variable o función auxiliar, unicamente se considerá obligatorio los siguientes puntos:

1. **Servicios de Integración:** Funciones que interactúan con Firebase (Firestore, Auth) o APIs externas.
2. **Lógica Compleja:** Algoritmos de clasificación (TensorFlow Lite), cálculos de recompensas o geolocalización.
3. **Puntos de Entrada (Backend):** Controladores principales de las Cloud Functions.
4. **Custom Hooks Principales (Frontend):** Aquellos que manejan estados globales o procesos asíncronos.
5. **Componentes Visuales:** Elementos reutilizables clave (ej. botones primarios, modales base, escáner de cámara).

## 4. Estándar para TSDoc

Toda función principal debe incluir un bloque de comentario TSDoc justo encima de su declaración.

### Etiquetas obligatorias

- Una breve descripción de lo que hace la función.
- `@param`: Descripción de los parámetros de entrada (si los hay).
- `@returns`: Descripción de lo que devuelve la función (si aplica).
- `@throws`: Descripción de los errores o excepciones que la función podría emitir.

### Ejemplo de Backend (Cloud Functions)

```typescript
/**
 * Procesa el reporte de un residuo escaneado y asigna puntos al usuario.
 * * @param userId - El ID único del usuario en Firebase Auth.
 * @param wasteData - Objeto que contiene el tipo de residuo y su peso.
 * @returns Una promesa que resuelve con el ID del reporte generado.
 * @throws {FunctionsError} Si el usuario no existe o faltan datos requeridos.
 */
export const processWasteReport = async (
    userId: string,
    wasteData: WastePayload,
): Promise<string> => {
    // ...
};
```

### Ejemplo de Fronted (React Native Hook)

```typescript
/**
 * Hook para gestionar la inicialización y uso del modelo de TensorFlow Lite.
 * * @param modelPath - Ruta local o URL del modelo pre-entrenado.
 * @returns Un objeto con el estado de carga y la función de clasificación.
 */
export const useWasteClassifier = (modelPath: string) => {
    // ...
};
```

## Estándar de Storybook

Los componentes visuales deben de tener un archivo de "historia" asociado `[NombreComponente].stories.tsx` ubicado en la carpeta centralizada `__stories__`.

### Ejemplo de Storybook

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { ScannerButton } from './ScannerButton';

const meta = {
    title: 'Componentes/ScannerButton',
    component: ScannerButton,
    tags: ['autodocs'],
} satisfies Meta<typeof ScannerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variante Principal
export const Primary: Story = {
    args: {
        title: 'Escanear Residuo',
        isActive: true,
    },
};

// Variante Deshabilitada
export const Disabled: Story = {
    args: {
        title: 'Cámara no disponible',
        isActive: false,
    },
};
```
