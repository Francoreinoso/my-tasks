import { describe, it, expect, beforeEach } from 'vitest';
import { getHabit } from './getHabit.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { Habit } from '@/domain/habit/Habit.js';
import { HabitNotFoundError } from '@/domain/habit/errors.js';

describe('getHabit', () => {
  let repo: InMemoryHabitRepository;

  beforeEach(() => {
    repo = new InMemoryHabitRepository();
  });

  it('devuelve el hábito si existe', async () => {
    const habit = Habit.create({ name: 'X' });
    await repo.save(habit);

    const found = await getHabit(repo, habit.id);
    expect(found.id).toBe(habit.id);
  });

  it('lanza HabitNotFoundError si no existe', async () => {
    await expect(getHabit(repo, 'no-existe')).rejects.toThrow(HabitNotFoundError);
  });
});
