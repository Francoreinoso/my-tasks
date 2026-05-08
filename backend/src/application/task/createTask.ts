import { Task, type CreateTaskInput } from '@/domain/task/Task.js';
import type { TaskRepository } from '@/domain/task/TaskRepository.js';

export async function createTask(repo: TaskRepository, input: CreateTaskInput): Promise<Task> {
  const task = Task.create(input);
  await repo.save(task);
  return task;
}
