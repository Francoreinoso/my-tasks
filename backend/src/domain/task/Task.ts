import { TaskValidationError } from './errors.js';

export type TaskStatus = 'pending' | 'completed';

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}

export interface TaskSnapshot {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MAX_TITLE_LENGTH = 200;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim();
  if (trimmed.length === 0) {
    throw new TaskValidationError('El título de la tarea no puede estar vacío');
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new TaskValidationError(
      `El título no puede tener más de ${MAX_TITLE_LENGTH} caracteres`,
    );
  }
  return trimmed;
}

function normalizeDescription(rawDescription: string | null | undefined): string | null {
  if (rawDescription === null || rawDescription === undefined) return null;
  const trimmed = rawDescription.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Valida y normaliza una fecha ISO (YYYY-MM-DD).
 * Detecta fechas calendario inválidas tipo "2026-02-30" comparando contra
 * el round-trip por Date, ya que el constructor de Date las "corrige" silenciosamente.
 */
function normalizeDueDate(rawDueDate: string | null | undefined): string | null {
  if (rawDueDate === null || rawDueDate === undefined) return null;
  const trimmed = rawDueDate.trim();
  if (trimmed.length === 0) return null;

  if (!ISO_DATE_REGEX.test(trimmed)) {
    throw new TaskValidationError(
      `dueDate debe estar en formato YYYY-MM-DD (recibido: "${trimmed}")`,
    );
  }

  const parsed = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new TaskValidationError(`dueDate inválida: "${trimmed}"`);
  }
  // Round-trip check: si Date "corrigió" (ej. Feb 30 → Mar 2), rechazamos.
  if (parsed.toISOString().slice(0, 10) !== trimmed) {
    throw new TaskValidationError(`dueDate inválida: "${trimmed}"`);
  }
  return trimmed;
}

export class Task {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly dueDate: string | null;
  readonly status: TaskStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(snapshot: TaskSnapshot) {
    this.id = snapshot.id;
    this.title = snapshot.title;
    this.description = snapshot.description;
    this.dueDate = snapshot.dueDate;
    this.status = snapshot.status;
    this.createdAt = snapshot.createdAt;
    this.updatedAt = snapshot.updatedAt;
  }

  static create(input: CreateTaskInput): Task {
    const title = normalizeTitle(input.title);
    const description = normalizeDescription(input.description ?? null);
    const dueDate = normalizeDueDate(input.dueDate ?? null);
    const now = new Date();
    return new Task({
      id: crypto.randomUUID(),
      title,
      description,
      dueDate,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(snapshot: TaskSnapshot): Task {
    return new Task(snapshot);
  }

  toJSON(): TaskSnapshot {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private withChanges(changes: Partial<TaskSnapshot>): Task {
    return new Task({ ...this.toJSON(), ...changes, updatedAt: new Date() });
  }

  complete(): Task {
    if (this.status === 'completed') return this;
    return this.withChanges({ status: 'completed' });
  }

  uncomplete(): Task {
    if (this.status === 'pending') return this;
    return this.withChanges({ status: 'pending' });
  }

  toggle(): Task {
    return this.status === 'pending' ? this.complete() : this.uncomplete();
  }

  updateTitle(newTitle: string): Task {
    const normalized = normalizeTitle(newTitle);
    if (normalized === this.title) return this;
    return this.withChanges({ title: normalized });
  }

  updateDescription(newDescription: string | null): Task {
    const normalized = normalizeDescription(newDescription);
    if (normalized === this.description) return this;
    return this.withChanges({ description: normalized });
  }

  setDueDate(newDueDate: string | null): Task {
    const normalized = normalizeDueDate(newDueDate);
    if (normalized === this.dueDate) return this;
    return this.withChanges({ dueDate: normalized });
  }
}
