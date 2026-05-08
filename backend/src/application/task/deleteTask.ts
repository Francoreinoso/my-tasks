import type { TaskRepository } from '@/domain/task/TaskRepository.js';
import { TaskNotFoundError } from '@/domain/task/errors.js';

export async function deleteTask(repo: TaskRepository, id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new TaskNotFoundError(id);
  await repo.delete(id);
}
