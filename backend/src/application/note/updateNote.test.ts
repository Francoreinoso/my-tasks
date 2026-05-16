import { describe, it, expect, beforeEach } from 'vitest';
import { updateNote } from './updateNote.js';
import { InMemoryNoteRepository } from '@/infrastructure/persistence/InMemoryNoteRepository.js';
import { Note } from '@/domain/note/Note.js';
import { NoteNotFoundError } from '@/domain/note/errors.js';

describe('updateNote', () => {
  let repo: InMemoryNoteRepository;

  beforeEach(() => {
    repo = new InMemoryNoteRepository();
  });

  it('actualiza título y contenido', async () => {
    const note = Note.create({ title: 'Viejo', content: 'x' });
    await repo.save(note);

    const updated = await updateNote(repo, note.id, {
      title: 'Nuevo',
      content: 'y',
    });

    expect(updated.title).toBe('Nuevo');
    expect(updated.content).toBe('y');

    const reloaded = await repo.findById(note.id);
    expect(reloaded?.title).toBe('Nuevo');
  });

  it('ignora campos no provistos (undefined)', async () => {
    const note = Note.create({ title: 'Original', content: 'preservar' });
    await repo.save(note);

    const updated = await updateNote(repo, note.id, { title: 'Cambiado' });

    expect(updated.title).toBe('Cambiado');
    expect(updated.content).toBe('preservar');
  });

  it('permite limpiar el título (null) si hay contenido', async () => {
    const note = Note.create({ title: 'X', content: 'tiene contenido' });
    await repo.save(note);

    const updated = await updateNote(repo, note.id, { title: null });
    expect(updated.title).toBeNull();
  });

  it('lanza NoteNotFoundError si no existe', async () => {
    await expect(updateNote(repo, 'no-existe', { title: 'X' })).rejects.toThrow(
      NoteNotFoundError,
    );
  });
});
