const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/+$/, "");
const backendMediaBaseUrl = (import.meta.env.VITE_BACKEND_URL_MEDIA ?? "").replace(/\/+$/, "");

export function buildBackendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendBaseUrl}${normalizedPath}`;
}

export function buildBackendMediaUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendMediaBaseUrl}${normalizedPath}`;
}
