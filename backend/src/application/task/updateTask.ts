import type { Task } from '@/domain/task/Task.js';
import type { TaskRepository } from '@/domain/task/TaskRepository.js';
import { TaskNotFoundError } from '@/domain/task/errors.js';

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
}

export async function updateTask(
  repo: TaskRepository,
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const existing = await repo.findById(id);
  if (!existing) throw new TaskNotFoundError(id);

  let updated = existing;
  if (input.title !== undefined) updated = updated.updateTitle(input.title);
  if (input.description !== undefined) updated = updated.updateDescription(input.description);
  if (input.dueDate !== undefined) updated = updated.setDueDate(input.dueDate);

  if (updated !== existing) {
    await repo.save(updated);
  }
  return updated;
}
