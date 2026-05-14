import { describe, it, expect, beforeEach } from 'vitest';
import { unmarkHabitDay } from './unmarkHabitDay.js';
import { markHabitDay } from './markHabitDay.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { InMemoryHabitCompletionRepository } from '@/infrastructure/persistence/InMemoryHabitCompletionRepository.js';
import { Habit } from '@/domain/habit/Habit.js';
import { HabitNotFoundError, HabitArchivedError } from '@/domain/habit/errors.js';

describe('unmarkHabitDay', () => {
  let habitRepo: InMemoryHabitRepository;
  let completionsRepo: InMemoryHabitCompletionRepository;

  beforeEach(() => {
    habitRepo = new InMemoryHabitRepository();
    completionsRepo = new InMemoryHabitCompletionRepository();
  });

  it('borra la completion del día indicado', async () => {
    const habit = Habit.create({ name: 'X' });
    await habitRepo.save(habit);
    await markHabitDay(habitRepo, completionsRepo, habit.id, '2026-05-14');

    await unmarkHabitDay(habitRepo, completionsRepo, habit.id, '2026-05-14');

    const stored = await completionsRepo.findByHabitAndDate(habit.id, '2026-05-14');
    expect(stored).toBeNull();
  });

  it('es idempotente: desmarcar un día no marcado no falla', async () => {
    const habit = Habit.create({ name: 'X' });
    await habitRepo.save(habit);

    await expect(
      unmarkHabitDay(habitRepo, completionsRepo, habit.id, '2026-05-14'),
    ).resolves.toBeUndefined();
  });

  it('lanza HabitNotFoundError si el hábito no existe', async () => {
    await expect(
      unmarkHabitDay(habitRepo, completionsRepo, 'no-existe', '2026-05-14'),
    ).rejects.toThrow(HabitNotFoundError);
  });

  it('lanza HabitArchivedError si el hábito está archivado', async () => {
    const habit = Habit.create({ name: 'X' }).archive();
    await habitRepo.save(habit);

    await expect(
      unmarkHabitDay(habitRepo, completionsRepo, habit.id, '2026-05-14'),
    ).rejects.toThrow(HabitArchivedError);
  });
});
