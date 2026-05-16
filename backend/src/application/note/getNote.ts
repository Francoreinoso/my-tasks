import type { Note } from '@/domain/note/Note.js';
import type { NoteRepository } from '@/domain/note/NoteRepository.js';
import { NoteNotFoundError } from '@/domain/note/errors.js';

export async function getNote(repo: NoteRepository, id: string): Promise<Note> {
  const note = await repo.findById(id);
  if (!note) throw new NoteNotFoundError(id);
  return note;
}
