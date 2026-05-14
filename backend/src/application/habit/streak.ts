import type { Habit } from '@/domain/habit/Habit.js';
import type { HabitCompletion } from '@/domain/habit/HabitCompletion.js';
import { assertIsoDate, previousDay, toIsoDate } from './dateUtils.js';

/**
 * Cuenta días aplicables consecutivos cumplidos hacia atrás desde asOfDate.
 *
 * Reglas:
 *   - Si un día NO es aplicable según la frecuencia (ej. sábado para un hábito
 *     lun-vie), no toca la racha (se "salta", ni suma ni rompe).
 *   - Si un día aplicable está cumplido, la racha suma 1.
 *   - Si un día aplicable NO está cumplido, la racha se corta.
 *   - El recorrido nunca cruza por debajo de habit.createdAt: si llegamos a una
 *     fecha previa a la creación del hábito, paramos.
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
  const createdAtIso = toIsoDate(habit.createdAt);

  let streak = 0;
  let current = asOfDate;

  while (current >= createdAtIso) {
    if (habit.isApplicableOn(current)) {
      if (completedDates.has(current)) {
        streak++;
      } else {
        break;
      }
    }
    current = previousDay(current);
  }

  return streak;
}
