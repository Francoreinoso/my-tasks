import type { HabitRepository } from '@/domain/habit/HabitRepository.js';
import type { HabitCompletionRepository } from '@/domain/habit/HabitCompletionRepository.js';
import { HabitNotFoundError, HabitArchivedError } from '@/domain/habit/errors.js';

/**
 * Desmarca un día previamente cumplido. Idempotente: si no había completion
 * para esa fecha, no hace nada. Rechaza cambios en hábitos archivados.
 */
export async function unmarkHabitDay(
  habitRepo: HabitRepository,
  completionsRepo: HabitCompletionRepository,
  habitId: string,
  date: string,
): Promise<void> {
  const habit = await habitRepo.findById(habitId);
  if (!habit) throw new HabitNotFoundError(habitId);
  if (habit.isArchived) throw new HabitArchivedError(habitId);

  const existing = await completionsRepo.findByHabitAndDate(habitId, date);
  if (existing) {
    await completionsRepo.delete(existing.id);
  }
}
