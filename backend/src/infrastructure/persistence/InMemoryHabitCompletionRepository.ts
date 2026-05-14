import type { HabitCompletion } from '@/domain/habit/HabitCompletion.js';
import type { HabitCompletionRepository } from '@/domain/habit/HabitCompletionRepository.js';

/**
 * Implementación in-memory. Las queries por rango aprovechan que las
 * fechas en formato YYYY-MM-DD son lexicográficamente ordenables.
 */
export class InMemoryHabitCompletionRepository implements HabitCompletionRepository {
  private readonly completions = new Map<string, HabitCompletion>();

  findById(id: string): Promise<HabitCompletion | null> {
    return Promise.resolve(this.completions.get(id) ?? null);
  }

  findByHabitAndDate(habitId: string, date: string): Promise<HabitCompletion | null> {
    for (const c of this.completions.values()) {
      if (c.habitId === habitId && c.date === date) {
        return Promise.resolve(c);
      }
    }
    return Promise.resolve(null);
  }

  findByHabitInRange(
    habitId: string,
    from: string,
    to: string,
  ): Promise<HabitCompletion[]> {
    const result: HabitCompletion[] = [];
    for (const c of this.completions.values()) {
      if (c.habitId === habitId && c.date >= from && c.date <= to) {
        result.push(c);
      }
    }
    return Promise.resolve(result);
  }

  save(completion: HabitCompletion): Promise<void> {
    this.completions.set(completion.id, completion);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.completions.delete(id);
    return Promise.resolve();
  }

  deleteAllByHabit(habitId: string): Promise<void> {
    for (const [id, c] of this.completions.entries()) {
      if (c.habitId === habitId) this.completions.delete(id);
    }
    return Promise.resolve();
  }
}
