import type { Habit, HabitFrequency } from '@/domain/habit/Habit.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';
import { HabitNotFoundError } from '@/domain/habit/errors.js';

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  frequency?: HabitFrequency;
}

export async function updateHabit(
  repo: HabitRepository,
  id: string,
  input: UpdateHabitInput,
): Promise<Habit> {
  const existing = await repo.findById(id);
  if (!existing) throw new HabitNotFoundError(id);

  let updated = existing;
  if (input.name !== undefined) updated = updated.updateName(input.name);
  if (input.description !== undefined) updated = updated.updateDescription(input.description);
  if (input.frequency !== undefined) updated = updated.updateFrequency(input.frequency);

  if (updated !== existing) {
    await repo.save(updated);
  }
  return updated;
}
