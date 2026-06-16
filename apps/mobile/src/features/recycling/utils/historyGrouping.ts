import type { RecyclingLogListItem } from '@/src/types/recycling';

export type Horizon = 'all' | 'today' | 'week' | 'month';

export const HORIZONS: { id: Horizon; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
];

const DAY_MS = 86_400_000;

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function startOfWeek(d: Date): number {
  const s = new Date(startOfDay(d));
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7)); // lunes como inicio
  return s.getTime();
}

function startOfMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

/** Inicio del horizonte en ms (local); null = sin límite. */
export function horizonStart(horizon: Horizon, now: Date = new Date()): number | null {
  switch (horizon) {
    case 'today':
      return startOfDay(now);
    case 'week':
      return startOfWeek(now);
    case 'month':
      return startOfMonth(now);
    default:
      return null;
  }
}

export type HistorySection = { title: string; data: RecyclingLogListItem[] };

export function sectionTitleFor(iso: string, now: Date = new Date()): string {
  const t = new Date(iso).getTime();
  if (t >= startOfDay(now)) return 'Hoy';
  if (t >= startOfDay(now) - DAY_MS) return 'Ayer';
  if (t >= startOfWeek(now)) return 'Esta semana';
  if (t >= startOfMonth(now)) return 'Este mes';
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Agrupa registros (orden desc) en secciones por fecha. */
export function groupByDateSection(
  items: RecyclingLogListItem[],
  now: Date = new Date(),
): HistorySection[] {
  const sections: HistorySection[] = [];
  for (const item of items) {
    const title = sectionTitleFor(item.createdAt, now);
    const last = sections[sections.length - 1];
    if (last && last.title === title) {
      last.data.push(item);
    } else {
      sections.push({ title, data: [item] });
    }
  }
  return sections;
}

const MONTHS_ABBR = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Hora "14:20" para hoy/ayer (la sección ya da el día); "13 jun · 14:20" para fechas viejas. */
export function formatHistoryTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  if (d.getTime() >= startOfDay(now) - DAY_MS) return time;
  return `${d.getDate()} ${MONTHS_ABBR[d.getMonth()]} · ${time}`;
}
