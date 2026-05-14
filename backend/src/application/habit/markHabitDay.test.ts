import { describe, it, expect, beforeEach } from 'vitest';
import { markHabitDay } from './markHabitDay.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { InMemoryHabitCompletionRepository } from '@/infrastructure/persistence/InMemoryHabitCompletionRepository.js';
import { Habit } from '@/domain/habit/Habit.js';
import { HabitNotFoundError, HabitArchivedError } from '@/domain/habit/errors.js';

describe('markHabitDay', () => {
  let habitRepo: InMemoryHabitRepository;
  let completionsRepo: InMemoryHabitCompletionRepository;

  beforeEach(() => {
    habitRepo = new InMemoryHabitRepository();
    completionsRepo = new InMemoryHabitCompletionRepository();
  });

  it('crea una completion para el día indicado', async () => {
    const habit = Habit.create({ name: 'X' });
    await habitRepo.save(habit);

    const completion = await markHabitDay(habitRepo, completionsRepo, habit.id, '2026-05-14');

    expect(completion.habitId).toBe(habit.id);
    expect(completion.date).toBe('2026-05-14');

    const stored = await completionsRepo.findByHabitAndDate(habit.id, '2026-05-14');
    expect(stored?.id).toBe(completion.id);
  });

  it('es idempotente: marcar dos veces el mismo día no duplica', async () => {
    const habit = Habit.create({ name: 'X' });
    await habitRepo.save(habit);

    const first = await markHabitDay(habitRepo, completionsRepo, habit.id, '2026-05-14');
    const second = await markHabitDay(habitRepo, completionsRepo, habit.id, '2026-05-14');

    expect(second.id).toBe(first.id);
    const all = await completionsRepo.findByHabitInRange(habit.id, '2026-05-01', '2026-05-31');
    expect(all).toHaveLength(1);
  });

  it('lanza HabitNotFoundError si el hábito no existe', async () => {
    await expect(
      markHabitDay(habitRepo, completionsRepo, 'no-existe', '2026-05-14'),
    ).rejects.toThrow(HabitNotFoundError);
  });

  it('lanza HabitArchivedError si el hábito está archivado', async () => {
    const habit = Habit.create({ name: 'X' }).archive();
    await habitRepo.save(habit);

    await expect(
      markHabitDay(habitRepo, completionsRepo, habit.id, '2026-05-14'),
    ).rejects.toThrow(HabitArchivedError);
  });

  it('valida formato de fecha vía la entidad HabitCompletion', async () => {
    const habit = Habit.create({ name: 'X' });
    await habitRepo.save(habit);

    await expect(
      markHabitDay(habitRepo, completionsRepo, habit.id, 'mañana'),
    ).rejects.toThrow(/YYYY-MM-DD/);
  });
});
