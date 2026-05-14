import type { Habit } from '@/domain/habit/Habit.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';
import { HabitNotFoundError } from '@/domain/habit/errors.js';

export async function archiveHabit(repo: HabitRepository, id: string): Promise<Habit> {
  const existing = await repo.findById(id);
  if (!existing) throw new HabitNotFoundError(id);

  const archived = existing.archive();
  if (archived !== existing) {
    await repo.save(archived);
  }
  return archived;
}
