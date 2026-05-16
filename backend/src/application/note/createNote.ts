import { Note, type CreateNoteInput } from '@/domain/note/Note.js';
import type { NoteRepository } from '@/domain/note/NoteRepository.js';

export async function createNote(
  repo: NoteRepository,
  input: CreateNoteInput,
): Promise<Note> {
  const note = Note.create(input);
  await repo.save(note);
  return note;
}
