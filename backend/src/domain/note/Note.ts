import { NoteValidationError } from './errors.js';

export interface CreateNoteInput {
  title?: string | null;
  content?: string | null;
}

export interface NoteSnapshot {
  id: string;
  title: string | null;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 10000;

function normalizeTitle(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new NoteValidationError(
      `El título no puede tener más de ${MAX_TITLE_LENGTH} caracteres`,
    );
  }
  return trimmed;
}

function normalizeContent(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    throw new NoteValidationError(
      `El contenido no puede tener más de ${MAX_CONTENT_LENGTH} caracteres`,
    );
  }
  return trimmed;
}

function ensureNotBothEmpty(
  title: string | null,
  content: string | null,
): void {
  if (title === null && content === null) {
    throw new NoteValidationError(
      'La nota debe tener al menos un título o un contenido',
    );
  }
}

export class Note {
  readonly id: string;
  readonly title: string | null;
  readonly content: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(snapshot: NoteSnapshot) {
    this.id = snapshot.id;
    this.title = snapshot.title;
    this.content = snapshot.content;
    this.createdAt = snapshot.createdAt;
    this.updatedAt = snapshot.updatedAt;
  }

  static create(input: CreateNoteInput): Note {
    const title = normalizeTitle(input.title);
    const content = normalizeContent(input.content);
    ensureNotBothEmpty(title, content);
    const now = new Date();
    return new Note({
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(snapshot: NoteSnapshot): Note {
    return new Note(snapshot);
  }

  toJSON(): NoteSnapshot {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private withChanges(changes: Partial<NoteSnapshot>): Note {
    return new Note({ ...this.toJSON(), ...changes, updatedAt: new Date() });
  }

  updateTitle(newTitle: string | null): Note {
    const normalized = normalizeTitle(newTitle);
    if (normalized === this.title) return this;
    ensureNotBothEmpty(normalized, this.content);
    return this.withChanges({ title: normalized });
  }

  updateContent(newContent: string | null): Note {
    const normalized = normalizeContent(newContent);
    if (normalized === this.content) return this;
    ensureNotBothEmpty(this.title, normalized);
    return this.withChanges({ content: normalized });
  }
}
