import type { Note } from '@/domain/note/Note.js';
import type { NoteRepository } from '@/domain/note/NoteRepository.js';
import { NoteNotFoundError } from '@/domain/note/errors.js';

export interface UpdateNoteInput {
  title?: string | null;
  content?: string | null;
}

export async function updateNote(
  repo: NoteRepository,
  id: string,
  input: UpdateNoteInput,
): Promise<Note> {
  const existing = await repo.findById(id);
  if (!existing) throw new NoteNotFoundError(id);

  let updated = existing;
  if (input.title !== undefined) updated = updated.updateTitle(input.title);
  if (input.content !== undefined) updated = updated.updateContent(input.content);

  if (updated !== existing) {
    await repo.save(updated);
  }
  return updated;
}
