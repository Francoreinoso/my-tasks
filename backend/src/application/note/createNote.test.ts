import { describe, it, expect, beforeEach } from 'vitest';
import { createNote } from './createNote.js';
import { InMemoryNoteRepository } from '@/infrastructure/persistence/InMemoryNoteRepository.js';

describe('createNote', () => {
  let repo: InMemoryNoteRepository;

  beforeEach(() => {
    repo = new InMemoryNoteRepository();
  });

  it('crea y persiste una nota con título y contenido', async () => {
    const note = await createNote(repo, { title: 'Compras', content: '- pan' });

    expect(note.title).toBe('Compras');
    expect(note.content).toBe('- pan');

    const stored = await repo.findById(note.id);
    expect(stored?.title).toBe('Compras');
  });

  it('acepta nota sin título', async () => {
    const note = await createNote(repo, { content: 'solo contenido' });
    expect(note.title).toBeNull();
  });

  it('propaga errores de validación sin persistir basura', async () => {
    await expect(createNote(repo, { title: '', content: '' })).rejects.toThrow(
      /título.*contenido|contenido.*título/i,
    );
    expect(await repo.findAll()).toHaveLength(0);
  });
});
