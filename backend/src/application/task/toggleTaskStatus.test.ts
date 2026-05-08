import { describe, it, expect, beforeEach } from 'vitest';
import { toggleTaskStatus } from './toggleTaskStatus.js';
import { createTask } from './createTask.js';
import { InMemoryTaskRepository } from '@/infrastructure/persistence/InMemoryTaskRepository.js';
import { TaskNotFoundError } from '@/domain/task/errors.js';

describe('toggleTaskStatus', () => {
  let repo: InMemoryTaskRepository;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
  });

  it('alterna de pending a completed', async () => {
    const task = await createTask(repo, { title: 'X' });
    expect(task.status).toBe('pending');

    const toggled = await toggleTaskStatus(repo, task.id);
    expect(toggled.status).toBe('completed');

    const stored = await repo.findById(task.id);
    expect(stored?.status).toBe('completed');
  });

  it('alterna de completed a pending', async () => {
    const task = await createTask(repo, { title: 'X' });
    await toggleTaskStatus(repo, task.id);
    const toggledTwice = await toggleTaskStatus(repo, task.id);

    expect(toggledTwice.status).toBe('pending');
  });

  it('lanza TaskNotFoundError si la tarea no existe', async () => {
    await expect(toggleTaskStatus(repo, 'no-existe')).rejects.toBeInstanceOf(TaskNotFoundError);
  });
});
