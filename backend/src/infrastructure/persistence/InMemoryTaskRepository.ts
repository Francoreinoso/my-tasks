import type { Task } from '@/domain/task/Task.js';
import type { TaskRepository } from '@/domain/task/TaskRepository.js';

/**
 * Implementación de TaskRepository que vive solo en memoria.
 * Útil para tests y para correr la app sin persistencia real.
 * No sobrevive a reinicios del proceso.
 */
export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  findAll(): Promise<Task[]> {
    return Promise.resolve(Array.from(this.tasks.values()));
  }

  findById(id: string): Promise<Task | null> {
    return Promise.resolve(this.tasks.get(id) ?? null);
  }

  save(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.tasks.delete(id);
    return Promise.resolve();
  }
}
