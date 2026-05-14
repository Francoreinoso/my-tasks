import { HabitCompletion } from '@/domain/habit/HabitCompletion.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';
import type { HabitCompletionRepository } from '@/domain/habit/HabitCompletionRepository.js';
import { HabitNotFoundError, HabitArchivedError } from '@/domain/habit/errors.js';

/**
 * Marca un día como cumplido para un hábito. Idempotente: si ya existe una
 * completion para (habitId, date), la retorna sin crear duplicado.
 * Rechaza el marcado en hábitos archivados.
 */
export async function markHabitDay(
  habitRepo: HabitRepository,
  completionsRepo: HabitCompletionRepository,
  habitId: string,
  date: string,
): Promise<HabitCompletion> {
  const habit = await habitRepo.findById(habitId);
  if (!habit) throw new HabitNotFoundError(habitId);
  if (habit.isArchived) throw new HabitArchivedError(habitId);

  const existing = await completionsRepo.findByHabitAndDate(habitId, date);
  if (existing) return existing;

  const completion = HabitCompletion.create({ habitId, date });
  await completionsRepo.save(completion);
  return completion;
}
