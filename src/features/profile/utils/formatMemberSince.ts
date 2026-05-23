export function formatMemberSince(createdAt?: string) {
  if (!createdAt) {
    return undefined;
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const formatted = new Intl.DateTimeFormat('es-PE', {
    month: 'long',
    year: 'numeric',
  }).format(date);

  return `Activo desde ${formatted}`;
}
