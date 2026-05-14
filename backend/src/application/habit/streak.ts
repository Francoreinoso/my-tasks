import type { Habit } from '@/domain/habit/Habit.js';
import type { HabitCompletion } from '@/domain/habit/HabitCompletion.js';
import { assertIsoDate, previousDay } from './dateUtils.js';

/** Safety bound: ~27 años. Si alguna vez se alcanza, hay un bug en la frequency. */
const MAX_ITERATIONS = 10000;

/**
 * Cuenta días aplicables consecutivos cumplidos hacia atrás desde asOfDate.
 *
 * Reglas:
 *   - Si un día NO es aplicable según la frecuencia (ej. sábado para un hábito
 *     lun-vie), no toca la racha (se "salta", ni suma ni rompe).
 *   - Si un día aplicable está cumplido, la racha suma 1.
 *   - Si un día aplicable NO está cumplido, la racha se corta (return).
 *
 * No se aplica una cota inferior por habit.createdAt: respetamos las
 * completions tal como están persistidas (incluyendo marcado retroactivo
 * anterior a la creación del hábito).
 *
 * Es una función PURA: no toca repos, no lee la hora actual. El caller decide
 * qué asOfDate pasar (típicamente "hoy", pero los tests pueden inyectar).
 */
export function calculateStreak(
  habit: Habit,
  completions: HabitCompletion[],
  asOfDate: string,
): number {
  assertIsoDate(asOfDate);

  const completedDates = new Set(
    completions.filter((c) => c.habitId === habit.id).map((c) => c.date),
  );

  let streak = 0;
  let current = asOfDate;
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    if (habit.isApplicableOn(current)) {
      if (completedDates.has(current)) {
        streak++;
      } else {
        return streak;
      }
    }
    current = previousDay(current);
    iterations++;
  }

  return streak;
}
