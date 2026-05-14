import { describe, it, expect, beforeEach } from 'vitest';
import { createHabit } from './createHabit.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';

describe('createHabit', () => {
  let repo: InMemoryHabitRepository;

  beforeEach(() => {
    repo = new InMemoryHabitRepository();
  });

  it('crea y persiste un hábito con frecuencia diaria por defecto', async () => {
    const habit = await createHabit(repo, { name: 'Entrenar' });

    expect(habit.name).toBe('Entrenar');
    expect(habit.frequency).toEqual({ kind: 'daily' });

    const stored = await repo.findById(habit.id);
    expect(stored?.name).toBe('Entrenar');
  });

  it('propaga errores de validación sin persistir basura', async () => {
    await expect(createHabit(repo, { name: '' })).rejects.toThrow(/nombre/i);
    expect(await repo.findAll()).toHaveLength(0);
  });
});
