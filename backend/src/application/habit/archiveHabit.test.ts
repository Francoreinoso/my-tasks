import { describe, it, expect, beforeEach } from 'vitest';
import { archiveHabit } from './archiveHabit.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { Habit } from '@/domain/habit/Habit.js';
import { HabitNotFoundError } from '@/domain/habit/errors.js';

describe('archiveHabit', () => {
  let repo: InMemoryHabitRepository;

  beforeEach(() => {
    repo = new InMemoryHabitRepository();
  });

  it('archiva un hábito y persiste el cambio', async () => {
    const habit = Habit.create({ name: 'X' });
    await repo.save(habit);

    const archived = await archiveHabit(repo, habit.id);
    expect(archived.isArchived).toBe(true);

    const reloaded = await repo.findById(habit.id);
    expect(reloaded?.isArchived).toBe(true);
  });

  it('archivar uno ya archivado es idempotente', async () => {
    const habit = Habit.create({ name: 'X' }).archive();
    await repo.save(habit);

    const result = await archiveHabit(repo, habit.id);
    expect(result.isArchived).toBe(true);
  });

  it('lanza HabitNotFoundError si no existe', async () => {
    await expect(archiveHabit(repo, 'no-existe')).rejects.toThrow(HabitNotFoundError);
  });
});
