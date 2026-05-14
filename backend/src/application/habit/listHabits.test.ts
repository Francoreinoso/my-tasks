import { describe, it, expect, beforeEach } from 'vitest';
import { listActiveHabits, listArchivedHabits } from './listHabits.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { Habit } from '@/domain/habit/Habit.js';

describe('listActiveHabits / listArchivedHabits', () => {
  let repo: InMemoryHabitRepository;

  beforeEach(() => {
    repo = new InMemoryHabitRepository();
  });

  it('separa hábitos activos de archivados', async () => {
    const a = Habit.create({ name: 'Activo' });
    const b = Habit.create({ name: 'Archivado' }).archive();
    await repo.save(a);
    await repo.save(b);

    const active = await listActiveHabits(repo);
    const archived = await listArchivedHabits(repo);

    expect(active.map((h) => h.name)).toEqual(['Activo']);
    expect(archived.map((h) => h.name)).toEqual(['Archivado']);
  });

  it('devuelve arrays vacíos cuando no hay hábitos', async () => {
    expect(await listActiveHabits(repo)).toEqual([]);
    expect(await listArchivedHabits(repo)).toEqual([]);
  });
});
