import fs from 'node:fs/promises';
import path from 'node:path';
import { Note } from '@/domain/note/Note.js';
import type { NoteRepository } from '@/domain/note/NoteRepository.js';

interface PersistedNote {
  id: string;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Persistencia JSON con escritura atómica (write-then-rename) para evitar
 * corrupción ante caídas durante el flush.
 */
export class JsonNoteRepository implements NoteRepository {
  private constructor(
    private readonly filePath: string,
    private readonly notes: Map<string, Note>,
  ) {}

  static async load(filePath: string): Promise<JsonNoteRepository> {
    const notes = new Map<string, Note>();

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw) as PersistedNote[];
      for (const item of data) {
        const note = Note.fromPersistence({
          id: item.id,
          title: item.title,
          content: item.content,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        });
        notes.set(note.id, note);
      }
    } catch (err: unknown) {
      if (!isFileNotFound(err)) throw err;
    }

    return new JsonNoteRepository(filePath, notes);
  }

  findAll(): Promise<Note[]> {
    return Promise.resolve(Array.from(this.notes.values()));
  }

  findById(id: string): Promise<Note | null> {
    return Promise.resolve(this.notes.get(id) ?? null);
  }

  async save(note: Note): Promise<void> {
    this.notes.set(note.id, note);
    await this.flush();
  }

  async delete(id: string): Promise<void> {
    this.notes.delete(id);
    await this.flush();
  }

  private async flush(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    const serializable: PersistedNote[] = Array.from(this.notes.values()).map(
      (note) => {
        const snap = note.toJSON();
        return {
          id: snap.id,
          title: snap.title,
          content: snap.content,
          createdAt: snap.createdAt.toISOString(),
          updatedAt: snap.updatedAt.toISOString(),
        };
      },
    );

    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(serializable, null, 2), 'utf-8');
    await fs.rename(tmpPath, this.filePath);
  }
}

function isFileNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 'ENOENT'
  );
}
