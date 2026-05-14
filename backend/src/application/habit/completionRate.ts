import type { Habit } from '@/domain/habit/Habit.js';
import type { HabitCompletion } from '@/domain/habit/HabitCompletion.js';
import { assertIsoDate, nextDay } from './dateUtils.js';

export interface CompletionRate {
  applicable: number;
  completed: number;
  rate: number;
}

/**
 * Calcula cuántos días aplicables hubo en el rango [from, to] (inclusive) y
 * cuántos están cumplidos. La tasa es completed / applicable (0 si applicable=0).
 *
 * Es una función PURA. El caller controla el rango. Día no aplicable no cuenta
 * ni en applicable ni en completed.
 */
export function calculateCompletionRate(
  habit: Habit,
  completions: HabitCompletion[],
  from: string,
  to: string,
): CompletionRate {
  assertIsoDate(from);
  assertIsoDate(to);
  if (from > to) return { applicable: 0, completed: 0, rate: 0 };

  const completedDates = new Set(
    completions.filter((c) => c.habitId === habit.id).map((c) => c.date),
  );

  let applicable = 0;
  let completed = 0;
  let current = from;

  while (current <= to) {
    if (habit.isApplicableOn(current)) {
      applicable++;
      if (completedDates.has(current)) completed++;
    }
    current = nextDay(current);
  }

  const rate = applicable === 0 ? 0 : completed / applicable;
  return { applicable, completed, rate };
}
