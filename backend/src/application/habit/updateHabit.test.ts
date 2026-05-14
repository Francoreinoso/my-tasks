import { describe, it, expect, beforeEach } from 'vitest';
import { updateHabit } from './updateHabit.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { Habit } from '@/domain/habit/Habit.js';
import { HabitNotFoundError } from '@/domain/habit/errors.js';

describe('updateHabit', () => {
  let repo: InMemoryHabitRepository;

  beforeEach(() => {
    repo = new InMemoryHabitRepository();
  });

  it('actualiza name, description y frequency', async () => {
    const habit = Habit.create({ name: 'Viejo' });
    await repo.save(habit);

    const updated = await updateHabit(repo, habit.id, {
      name: 'Nuevo',
      description: 'detalles',
      frequency: { kind: 'weekdays' },
    });

    expect(updated.name).toBe('Nuevo');
    expect(updated.description).toBe('detalles');
    expect(updated.frequency).toEqual({ kind: 'weekdays' });

    const reloaded = await repo.findById(habit.id);
    expect(reloaded?.name).toBe('Nuevo');
  });

  it('ignora campos no provistos (undefined)', async () => {
    const habit = Habit.create({ name: 'Original', description: 'preservar' });
    await repo.save(habit);

    const updated = await updateHabit(repo, habit.id, { name: 'Cambiado' });

    expect(updated.name).toBe('Cambiado');
    expect(updated.description).toBe('preservar');
  });

  it('lanza HabitNotFoundError si no existe', async () => {
    await expect(updateHabit(repo, 'no-existe', { name: 'X' })).rejects.toThrow(
      HabitNotFoundError,
    );
  });
});
