import { describe, it, expect, beforeEach } from 'vitest';
import { updateTask } from './updateTask.js';
import { createTask } from './createTask.js';
import { InMemoryTaskRepository } from '@/infrastructure/persistence/InMemoryTaskRepository.js';
import { TaskNotFoundError } from '@/domain/task/errors.js';

describe('updateTask', () => {
  let repo: InMemoryTaskRepository;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
  });

  it('actualiza el título de una tarea existente', async () => {
    const task = await createTask(repo, { title: 'Viejo' });
    const updated = await updateTask(repo, task.id, { title: 'Nuevo' });

    expect(updated.title).toBe('Nuevo');
    const stored = await repo.findById(task.id);
    expect(stored?.title).toBe('Nuevo');
  });

  it('actualiza la descripción (incluyendo permitir null para borrarla)', async () => {
    const task = await createTask(repo, { title: 'X', description: 'inicial' });
    const cleared = await updateTask(repo, task.id, { description: null });
    expect(cleared.description).toBeNull();
  });

  it('asigna y borra dueDate', async () => {
    const task = await createTask(repo, { title: 'X' });
    const dated = await updateTask(repo, task.id, { dueDate: '2026-05-15' });
    expect(dated.dueDate).toBe('2026-05-15');

    const cleared = await updateTask(repo, task.id, { dueDate: null });
    expect(cleared.dueDate).toBeNull();
  });

  it('rechaza dueDate inválida con TaskValidationError', async () => {
    const task = await createTask(repo, { title: 'X' });
    await expect(
      updateTask(repo, task.id, { dueDate: 'mañana' }),
    ).rejects.toThrow(/YYYY-MM-DD/);
  });

  it('lanza TaskNotFoundError si la tarea no existe', async () => {
    await expect(updateTask(repo, 'no-existe', { title: 'X' })).rejects.toBeInstanceOf(
      TaskNotFoundError,
    );
  });

  it('si no hay cambios reales, no llama a save (no actualiza updatedAt)', async () => {
    const task = await createTask(repo, { title: 'Mismo' });
    const originalUpdatedAt = task.updatedAt;

    const result = await updateTask(repo, task.id, { title: 'Mismo' });
    expect(result.updatedAt).toEqual(originalUpdatedAt);
  });
});
