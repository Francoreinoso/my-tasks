import type { Task } from '@/domain/task/Task.js';
import type { TaskRepository } from '@/domain/task/TaskRepository.js';
import { TaskNotFoundError } from '@/domain/task/errors.js';

export async function toggleTaskStatus(repo: TaskRepository, id: string): Promise<Task> {
  const existing = await repo.findById(id);
  if (!existing) throw new TaskNotFoundError(id);

  const toggled = existing.toggle();
  await repo.save(toggled);
  return toggled;
}
