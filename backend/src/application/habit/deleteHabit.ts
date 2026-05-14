import type { HabitRepository } from '@/domain/habit/HabitRepository.js';
import type { HabitCompletionRepository } from '@/domain/habit/HabitCompletionRepository.js';
import { HabitNotFoundError } from '@/domain/habit/errors.js';

/**
 * Hard-delete: borra el hábito y todas sus completions asociadas (cascade).
 * Operación irreversible. Para esconder un hábito sin perder historial usar
 * archiveHabit en su lugar.
 */
export async function deleteHabit(
  habitRepo: HabitRepository,
  completionsRepo: HabitCompletionRepository,
  id: string,
): Promise<void> {
  const existing = await habitRepo.findById(id);
  if (!existing) throw new HabitNotFoundError(id);

  await completionsRepo.deleteAllByHabit(id);
  await habitRepo.delete(id);
}
