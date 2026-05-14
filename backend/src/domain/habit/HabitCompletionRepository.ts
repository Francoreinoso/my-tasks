import type { HabitCompletion } from './HabitCompletion.js';

/**
 * Contrato del repositorio de cumplimientos de hábito. Las queries por
 * rango y por (habitId, date) son las que necesitamos para:
 *   - mostrar los últimos N días en la UI (findByHabitInRange)
 *   - evitar duplicar el cumplimiento del mismo día (findByHabitAndDate)
 *   - calcular rachas y % de cumplimiento (findByHabitInRange)
 */
export interface HabitCompletionRepository {
  findById(id: string): Promise<HabitCompletion | null>;
  findByHabitAndDate(habitId: string, date: string): Promise<HabitCompletion | null>;
  findByHabit(habitId: string): Promise<HabitCompletion[]>;
  findByHabitInRange(
    habitId: string,
    from: string,
    to: string,
  ): Promise<HabitCompletion[]>;
  save(completion: HabitCompletion): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAllByHabit(habitId: string): Promise<void>;
}
