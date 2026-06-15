# Recycle Services

This folder separates domain services from UI and makes mock/real implementations explicit.

## Classification

- `classification/index.ts`: public service entrypoint used by screens.
- `classification/mocks/*`: mock providers used in local MVP/dev flows.
- `classification/providers/*`: real providers (Firebase/Cloud Functions, etc.).

Provider selection is controlled centrally in:

- `features/recycle/config.ts` -> `RECYCLE_USE_MOCKS`

## Rule

Screens must import only from service entrypoints (for example `classification/index.ts`), never directly from `mocks` or `providers`.
