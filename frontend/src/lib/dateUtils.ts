/**
 * Utilidades de fecha para my-tasks.
 *
 * Reglas:
 * - Storage usa siempre formato ISO local: "YYYY-MM-DD" (sin timezone).
 * - Display usa "DD-MM-YYYY" (formato latinoamericano).
 * - NUNCA se usa toISOString() para producir un YYYY-MM-DD: eso sería UTC y
 *   puede pisar al día anterior dependiendo de la zona horaria. Acá usamos
 *   getFullYear/getMonth/getDate que respetan la zona LOCAL.
 * - NUNCA se usa new Date('2026-05-15') sin hora, eso parsea como UTC.
 *   En su lugar usamos new Date(y, m-1, d) que respeta zona local.
 */

const DAY_NAMES_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DDMMYYYY_REGEX = /^(\d{2})-(\d{2})-(\d{4})$/;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
}

export function fromIsoDate(iso: string): Date {
  const parts = iso.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  // new Date(year, monthIndex, day) usa zona LOCAL, sin shifts de UTC
  return new Date(year, month - 1, day);
}

export function isValidIsoDate(iso: string): boolean {
  if (!ISO_DATE_REGEX.test(iso)) return false;
  const d = fromIsoDate(iso);
  return toIsoDate(d) === iso;
}

export function getMondayOf(date: Date): Date {
  // Domingo=0, Lunes=1, ..., Sábado=6
  const dayOfWeek = date.getDay();
  const daysFromMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - daysFromMonday);
  return monday;
}

export function getCurrentWeekStart(): string {
  return toIsoDate(getMondayOf(new Date()));
}

export function getWeekDays(weekStartIso: string): string[] {
  const start = fromIsoDate(weekStartIso);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push(toIsoDate(d));
  }
  return days;
}

export function addWeeks(iso: string, weeks: number): string {
  const d = fromIsoDate(iso);
  // Trabajar en milisegundos evita ambigüedades con DST en algunos casos.
  const shifted = new Date(d.getTime() + weeks * 7 * ONE_DAY_MS);
  return toIsoDate(shifted);
}

export function isoToday(): string {
  return toIsoDate(new Date());
}

/**
 * Devuelve un array con los últimos N días en ISO YYYY-MM-DD, ordenados de
 * más viejo a más nuevo (el último elemento es asOf). El default de asOf es hoy.
 */
export function lastNDays(n: number, asOfIso: string = isoToday()): string[] {
  const asOf = fromIsoDate(asOfIso);
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate() - i);
    days.push(toIsoDate(d));
  }
  return days;
}

/** Devuelve el día de la semana 0-6 (0=Domingo) para una fecha ISO. */
export function getWeekday(iso: string): number {
  return fromIsoDate(iso).getDay();
}

export function formatDDMMYYYY(iso: string): string {
  if (!ISO_DATE_REGEX.test(iso)) return iso;
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

export function parseDDMMYYYY(input: string): string | null {
  const match = DDMMYYYY_REGEX.exec(input);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const candidate = `${yyyy}-${mm}-${dd}`;
  return isValidIsoDate(candidate) ? candidate : null;
}

export function getWeekDayName(iso: string): string {
  const d = fromIsoDate(iso);
  return DAY_NAMES_ES[d.getDay()] ?? '';
}

export function formatWeekRange(weekStartIso: string): string {
  const days = getWeekDays(weekStartIso);
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';
  return `${formatDDMMYYYY(first)} al ${formatDDMMYYYY(last)}`;
}
