import { describe, it, expect, beforeEach } from 'vitest';
import { deleteTask } from './deleteTask.js';
import { createTask } from './createTask.js';
import { InMemoryTaskRepository } from '@/infrastructure/persistence/InMemoryTaskRepository.js';
import { TaskNotFoundError } from '@/domain/task/errors.js';

describe('deleteTask', () => {
  let repo: InMemoryTaskRepository;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
  });

  it('elimina una tarea existente', async () => {
    const task = await createTask(repo, { title: 'X' });
    await deleteTask(repo, task.id);

    expect(await repo.findById(task.id)).toBeNull();
  });

  it('lanza TaskNotFoundError si la tarea no existe', async () => {
    await expect(deleteTask(repo, 'no-existe')).rejects.toBeInstanceOf(TaskNotFoundError);
  });
});
