import type { Habit } from '@/domain/habit/Habit.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';
import { HabitNotFoundError } from '@/domain/habit/errors.js';

export async function getHabit(repo: HabitRepository, id: string): Promise<Habit> {
  const habit = await repo.findById(id);
  if (!habit) throw new HabitNotFoundError(id);
  return habit;
}
