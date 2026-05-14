import { HabitValidationError } from './errors.js';

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HabitFrequency =
  | { kind: 'daily' }
  | { kind: 'weekdays' }
  | { kind: 'custom'; days: readonly Weekday[] };

export interface CreateHabitInput {
  name: string;
  description?: string | null;
  frequency?: HabitFrequency;
}

export interface HabitSnapshot {
  id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

const MAX_NAME_LENGTH = 200;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeName(rawName: string): string {
  const trimmed = rawName.trim();
  if (trimmed.length === 0) {
    throw new HabitValidationError('El nombre del hábito no puede estar vacío');
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new HabitValidationError(
      `El nombre no puede tener más de ${MAX_NAME_LENGTH} caracteres`,
    );
  }
  return trimmed;
}

function normalizeDescription(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const trimmed = raw.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizeFrequency(freq: HabitFrequency): HabitFrequency {
  if (freq.kind === 'daily' || freq.kind === 'weekdays') return freq;

  const days = freq.days;
  if (days.length === 0) {
    throw new HabitValidationError(
      'La frecuencia custom debe incluir al menos un día',
    );
  }
  for (const d of days) {
    if (!Number.isInteger(d) || d < 0 || d > 6) {
      throw new HabitValidationError(
        `Los días deben estar entre 0 y 6 (recibido: ${d})`,
      );
    }
  }
  const unique = new Set(days);
  if (unique.size !== days.length) {
    throw new HabitValidationError('La lista de días tiene duplicados');
  }
  const sorted = [...days].sort((a, b) => a - b);
  return { kind: 'custom', days: sorted };
}

/**
 * Parsea una fecha YYYY-MM-DD y devuelve el día de la semana (0=dom, 6=sáb).
 * Usa UTC para evitar que la zona horaria local corra el día.
 */
function parseDateToWeekday(date: string): Weekday {
  const trimmed = date.trim();
  if (!ISO_DATE_REGEX.test(trimmed)) {
    throw new HabitValidationError(
      `La fecha debe estar en formato YYYY-MM-DD (recibido: "${trimmed}")`,
    );
  }
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new HabitValidationError(`Fecha inválida: "${trimmed}"`);
  }
  if (parsed.toISOString().slice(0, 10) !== trimmed) {
    throw new HabitValidationError(`Fecha inválida: "${trimmed}"`);
  }
  return parsed.getUTCDay() as Weekday;
}

function frequencyEquals(a: HabitFrequency, b: HabitFrequency): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'custom' && b.kind === 'custom') {
    if (a.days.length !== b.days.length) return false;
    return a.days.every((d, i) => d === b.days[i]);
  }
  return true;
}

export class Habit {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly frequency: HabitFrequency;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly archivedAt: Date | null;

  private constructor(snapshot: HabitSnapshot) {
    this.id = snapshot.id;
    this.name = snapshot.name;
    this.description = snapshot.description;
    this.frequency = snapshot.frequency;
    this.createdAt = snapshot.createdAt;
    this.updatedAt = snapshot.updatedAt;
    this.archivedAt = snapshot.archivedAt;
  }

  static create(input: CreateHabitInput): Habit {
    const name = normalizeName(input.name);
    const description = normalizeDescription(input.description ?? null);
    const frequency = normalizeFrequency(input.frequency ?? { kind: 'daily' });
    const now = new Date();
    return new Habit({
      id: crypto.randomUUID(),
      name,
      description,
      frequency,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    });
  }

  static fromPersistence(snapshot: HabitSnapshot): Habit {
    return new Habit(snapshot);
  }

  toJSON(): HabitSnapshot {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      frequency: this.frequency,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private withChanges(changes: Partial<HabitSnapshot>): Habit {
    return new Habit({ ...this.toJSON(), ...changes, updatedAt: new Date() });
  }

  get isArchived(): boolean {
    return this.archivedAt !== null;
  }

  archive(): Habit {
    if (this.isArchived) return this;
    return this.withChanges({ archivedAt: new Date() });
  }

  unarchive(): Habit {
    if (!this.isArchived) return this;
    return this.withChanges({ archivedAt: null });
  }

  updateName(newName: string): Habit {
    const normalized = normalizeName(newName);
    if (normalized === this.name) return this;
    return this.withChanges({ name: normalized });
  }

  updateDescription(newDescription: string | null): Habit {
    const normalized = normalizeDescription(newDescription);
    if (normalized === this.description) return this;
    return this.withChanges({ description: normalized });
  }

  updateFrequency(newFrequency: HabitFrequency): Habit {
    const normalized = normalizeFrequency(newFrequency);
    if (frequencyEquals(normalized, this.frequency)) return this;
    return this.withChanges({ frequency: normalized });
  }

  isApplicableOn(date: string): boolean {
    const weekday = parseDateToWeekday(date);
    switch (this.frequency.kind) {
      case 'daily':
        return true;
      case 'weekdays':
        return weekday >= 1 && weekday <= 5;
      case 'custom':
        return this.frequency.days.includes(weekday);
    }
  }
}
