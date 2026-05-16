import type { NoteRepository } from '@/domain/note/NoteRepository.js';
import { NoteNotFoundError } from '@/domain/note/errors.js';

export async function deleteNote(
  repo: NoteRepository,
  id: string,
): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NoteNotFoundError(id);
  await repo.delete(id);
}
