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

export function formatActiveTime(createdAt?: string): string {
  if (!createdAt) {
    return '0 Months';
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '0 Months';
  }

  const now = new Date();
  let months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  
  if (months <= 0) {
    return '1 Month';
  }
  
  return `${months} ${months === 1 ? 'Month' : 'Months'}`;
}
