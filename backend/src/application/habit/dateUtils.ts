const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Helpers para fechas YYYY-MM-DD usadas en cálculos de racha y % cumplimiento.
 * Todo se manipula en UTC para evitar drift por la zona horaria local del proceso.
 */

export function previousDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function assertIsoDate(date: string): void {
  if (!ISO_DATE_REGEX.test(date)) {
    throw new Error(`La fecha debe estar en formato YYYY-MM-DD (recibido: "${date}")`);
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error(`Fecha inválida: "${date}"`);
  }
}
