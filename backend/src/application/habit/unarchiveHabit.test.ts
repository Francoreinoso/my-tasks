import { describe, it, expect, beforeEach } from 'vitest';
import { unarchiveHabit } from './unarchiveHabit.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { Habit } from '@/domain/habit/Habit.js';
import { HabitNotFoundError } from '@/domain/habit/errors.js';

describe('unarchiveHabit', () => {
  let repo: InMemoryHabitRepository;

  beforeEach(() => {
    repo = new InMemoryHabitRepository();
  });

  it('restaura un hábito archivado y persiste el cambio', async () => {
    const habit = Habit.create({ name: 'X' }).archive();
    await repo.save(habit);

    const restored = await unarchiveHabit(repo, habit.id);
    expect(restored.isArchived).toBe(false);

    const reloaded = await repo.findById(habit.id);
    expect(reloaded?.isArchived).toBe(false);
  });

  it('restaurar uno ya activo es idempotente', async () => {
    const habit = Habit.create({ name: 'X' });
    await repo.save(habit);

    const result = await unarchiveHabit(repo, habit.id);
    expect(result.isArchived).toBe(false);
  });

  it('lanza HabitNotFoundError si no existe', async () => {
    await expect(unarchiveHabit(repo, 'no-existe')).rejects.toThrow(HabitNotFoundError);
  });
});
