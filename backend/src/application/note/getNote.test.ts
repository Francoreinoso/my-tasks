import { describe, it, expect, beforeEach } from 'vitest';
import { getNote } from './getNote.js';
import { InMemoryNoteRepository } from '@/infrastructure/persistence/InMemoryNoteRepository.js';
import { Note } from '@/domain/note/Note.js';
import { NoteNotFoundError } from '@/domain/note/errors.js';

describe('getNote', () => {
  let repo: InMemoryNoteRepository;

  beforeEach(() => {
    repo = new InMemoryNoteRepository();
  });

  it('devuelve la nota si existe', async () => {
    const note = Note.create({ title: 'X', content: 'y' });
    await repo.save(note);

    const found = await getNote(repo, note.id);
    expect(found.id).toBe(note.id);
  });

  it('lanza NoteNotFoundError si no existe', async () => {
    await expect(getNote(repo, 'no-existe')).rejects.toThrow(NoteNotFoundError);
  });
});
