import type { Habit } from '@/domain/habit/Habit.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';

export async function listActiveHabits(repo: HabitRepository): Promise<Habit[]> {
  const all = await repo.findAll();
  return all.filter((h) => !h.isArchived);
}

export async function listArchivedHabits(repo: HabitRepository): Promise<Habit[]> {
  const all = await repo.findAll();
  return all.filter((h) => h.isArchived);
}
