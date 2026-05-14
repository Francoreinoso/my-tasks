import { HabitCompletionValidationError } from './errors.js';

export interface CreateHabitCompletionInput {
  habitId: string;
  date: string;
}

export interface HabitCompletionSnapshot {
  id: string;
  habitId: string;
  date: string;
  createdAt: Date;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeHabitId(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new HabitCompletionValidationError('habitId no puede estar vacío');
  }
  return trimmed;
}

function normalizeDate(raw: string): string {
  const trimmed = raw.trim();
  if (!ISO_DATE_REGEX.test(trimmed)) {
    throw new HabitCompletionValidationError(
      `date debe estar en formato YYYY-MM-DD (recibido: "${trimmed}")`,
    );
  }
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new HabitCompletionValidationError(`date inválida: "${trimmed}"`);
  }
  if (parsed.toISOString().slice(0, 10) !== trimmed) {
    throw new HabitCompletionValidationError(`date inválida: "${trimmed}"`);
  }
  return trimmed;
}

export class HabitCompletion {
  readonly id: string;
  readonly habitId: string;
  readonly date: string;
  readonly createdAt: Date;

  private constructor(snapshot: HabitCompletionSnapshot) {
    this.id = snapshot.id;
    this.habitId = snapshot.habitId;
    this.date = snapshot.date;
    this.createdAt = snapshot.createdAt;
  }

  static create(input: CreateHabitCompletionInput): HabitCompletion {
    const habitId = normalizeHabitId(input.habitId);
    const date = normalizeDate(input.date);
    return new HabitCompletion({
      id: crypto.randomUUID(),
      habitId,
      date,
      createdAt: new Date(),
    });
  }

  static fromPersistence(snapshot: HabitCompletionSnapshot): HabitCompletion {
    return new HabitCompletion(snapshot);
  }

  toJSON(): HabitCompletionSnapshot {
    return {
      id: this.id,
      habitId: this.habitId,
      date: this.date,
      createdAt: this.createdAt,
    };
  }
}
