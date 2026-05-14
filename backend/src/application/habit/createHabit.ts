import { Habit, type CreateHabitInput } from '@/domain/habit/Habit.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';

export async function createHabit(
  repo: HabitRepository,
  input: CreateHabitInput,
): Promise<Habit> {
  const habit = Habit.create(input);
  await repo.save(habit);
  return habit;
}
