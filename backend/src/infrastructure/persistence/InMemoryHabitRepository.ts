import type { Habit } from '@/domain/habit/Habit.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';

/**
 * Implementación de HabitRepository que vive solo en memoria.
 * Útil para tests y para correr sin persistencia. No sobrevive a reinicios.
 */
export class InMemoryHabitRepository implements HabitRepository {
  private readonly habits = new Map<string, Habit>();

  findAll(): Promise<Habit[]> {
    return Promise.resolve(Array.from(this.habits.values()));
  }

  findById(id: string): Promise<Habit | null> {
    return Promise.resolve(this.habits.get(id) ?? null);
  }

  save(habit: Habit): Promise<void> {
    this.habits.set(habit.id, habit);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.habits.delete(id);
    return Promise.resolve();
  }
}
