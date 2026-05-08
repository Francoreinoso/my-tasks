import { describe, it, expect, beforeEach } from 'vitest';
import { createTask } from './createTask.js';
import { InMemoryTaskRepository } from '@/infrastructure/persistence/InMemoryTaskRepository.js';

describe('createTask', () => {
  let repo: InMemoryTaskRepository;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
  });

  it('crea y persiste una tarea con título', async () => {
    const task = await createTask(repo, { title: 'Estudiar Clean Architecture' });

    expect(task.title).toBe('Estudiar Clean Architecture');
    expect(task.status).toBe('pending');

    const stored = await repo.findById(task.id);
    expect(stored).not.toBeNull();
    expect(stored?.title).toBe('Estudiar Clean Architecture');
  });

  it('propaga errores de validación de la entidad (no persiste basura)', async () => {
    await expect(createTask(repo, { title: '' })).rejects.toThrow(/título/i);
    expect(await repo.findAll()).toHaveLength(0);
  });
});
