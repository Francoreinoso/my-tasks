import { describe, it, expect, beforeEach } from 'vitest';
import { deleteHabit } from './deleteHabit.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { InMemoryHabitCompletionRepository } from '@/infrastructure/persistence/InMemoryHabitCompletionRepository.js';
import { Habit } from '@/domain/habit/Habit.js';
import { HabitCompletion } from '@/domain/habit/HabitCompletion.js';
import { HabitNotFoundError } from '@/domain/habit/errors.js';

describe('deleteHabit (cascade)', () => {
  let habitRepo: InMemoryHabitRepository;
  let completionsRepo: InMemoryHabitCompletionRepository;

  beforeEach(() => {
    habitRepo = new InMemoryHabitRepository();
    completionsRepo = new InMemoryHabitCompletionRepository();
  });

  it('borra el hábito y todas sus completions', async () => {
    const habit = Habit.create({ name: 'X' });
    await habitRepo.save(habit);
    await completionsRepo.save(
      HabitCompletion.create({ habitId: habit.id, date: '2026-05-10' }),
    );
    await completionsRepo.save(
      HabitCompletion.create({ habitId: habit.id, date: '2026-05-11' }),
    );

    await deleteHabit(habitRepo, completionsRepo, habit.id);

    expect(await habitRepo.findById(habit.id)).toBeNull();
    const cs = await completionsRepo.findByHabitInRange(
      habit.id,
      '2026-01-01',
      '2026-12-31',
    );
    expect(cs).toEqual([]);
  });

  it('no toca completions de otros hábitos', async () => {
    const h1 = Habit.create({ name: 'A' });
    const h2 = Habit.create({ name: 'B' });
    await habitRepo.save(h1);
    await habitRepo.save(h2);
    await completionsRepo.save(
      HabitCompletion.create({ habitId: h1.id, date: '2026-05-10' }),
    );
    await completionsRepo.save(
      HabitCompletion.create({ habitId: h2.id, date: '2026-05-10' }),
    );

    await deleteHabit(habitRepo, completionsRepo, h1.id);

    const survivors = await completionsRepo.findByHabitInRange(
      h2.id,
      '2026-01-01',
      '2026-12-31',
    );
    expect(survivors).toHaveLength(1);
  });

  it('lanza HabitNotFoundError si no existe', async () => {
    await expect(
      deleteHabit(habitRepo, completionsRepo, 'no-existe'),
    ).rejects.toThrow(HabitNotFoundError);
  });
});
