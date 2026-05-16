import { describe, it, expect, beforeEach } from 'vitest';
import { listNotes } from './listNotes.js';
import { InMemoryNoteRepository } from '@/infrastructure/persistence/InMemoryNoteRepository.js';
import { Note } from '@/domain/note/Note.js';

describe('listNotes', () => {
  let repo: InMemoryNoteRepository;

  beforeEach(() => {
    repo = new InMemoryNoteRepository();
  });

  it('devuelve array vacío cuando no hay notas', async () => {
    expect(await listNotes(repo)).toEqual([]);
  });

  it('ordena por updatedAt descendente (más reciente primero)', async () => {
    const a = Note.create({ title: 'A', content: 'x' });
    // Forzar diferencia temporal mínima
    await new Promise((r) => setTimeout(r, 5));
    const b = Note.create({ title: 'B', content: 'x' });
    await new Promise((r) => setTimeout(r, 5));
    const c = Note.create({ title: 'C', content: 'x' });

    await repo.save(a);
    await repo.save(b);
    await repo.save(c);

    const list = await listNotes(repo);
    expect(list.map((n) => n.title)).toEqual(['C', 'B', 'A']);
  });
});
