import { describe, it, expect, beforeEach } from 'vitest';
import { deleteNote } from './deleteNote.js';
import { InMemoryNoteRepository } from '@/infrastructure/persistence/InMemoryNoteRepository.js';
import { Note } from '@/domain/note/Note.js';
import { NoteNotFoundError } from '@/domain/note/errors.js';

describe('deleteNote', () => {
  let repo: InMemoryNoteRepository;

  beforeEach(() => {
    repo = new InMemoryNoteRepository();
  });

  it('borra la nota existente', async () => {
    const note = Note.create({ title: 'X', content: 'y' });
    await repo.save(note);

    await deleteNote(repo, note.id);

    expect(await repo.findById(note.id)).toBeNull();
  });

  it('lanza NoteNotFoundError si no existe', async () => {
    await expect(deleteNote(repo, 'no-existe')).rejects.toThrow(
      NoteNotFoundError,
    );
  });
});
