import type { Habit } from './Habit.js';

/**
 * Contrato del repositorio de hábitos. La capa de dominio no conoce
 * la persistencia concreta: puede ser memoria, JSON, o una BD.
 */
export interface HabitRepository {
  findAll(): Promise<Habit[]>;
  findById(id: string): Promise<Habit | null>;
  save(habit: Habit): Promise<void>;
  delete(id: string): Promise<void>;
}
