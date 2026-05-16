import type { Note } from '@/domain/note/Note.js';
import type { NoteRepository } from '@/domain/note/NoteRepository.js';

/**
 * Implementación de NoteRepository que vive solo en memoria.
 * Útil para tests y para correr sin persistencia. No sobrevive a reinicios.
 */
export class InMemoryNoteRepository implements NoteRepository {
  private readonly notes = new Map<string, Note>();

  findAll(): Promise<Note[]> {
    return Promise.resolve(Array.from(this.notes.values()));
  }

  findById(id: string): Promise<Note | null> {
    return Promise.resolve(this.notes.get(id) ?? null);
  }

  save(note: Note): Promise<void> {
    this.notes.set(note.id, note);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.notes.delete(id);
    return Promise.resolve();
  }
}
