import type { Task } from '@/domain/task/Task.js';
import type { TaskRepository } from '@/domain/task/TaskRepository.js';

export function listTasks(repo: TaskRepository): Promise<Task[]> {
  return repo.findAll();
}
