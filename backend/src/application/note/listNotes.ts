import type { Note } from '@/domain/note/Note.js';
import type { NoteRepository } from '@/domain/note/NoteRepository.js';

/**
 * Devuelve todas las notas ordenadas por fecha de actualización descendente
 * (las más recientes primero).
 */
export async function listNotes(repo: NoteRepository): Promise<Note[]> {
  const all = await repo.findAll();
  return [...all].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}
