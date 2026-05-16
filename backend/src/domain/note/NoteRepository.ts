import type { Note } from './Note.js';

/**
 * Contrato del repositorio de notas. La capa de dominio no conoce
 * la persistencia concreta: puede ser memoria, JSON, o una BD.
 */
export interface NoteRepository {
  findAll(): Promise<Note[]>;
  findById(id: string): Promise<Note | null>;
  save(note: Note): Promise<void>;
  delete(id: string): Promise<void>;
}
