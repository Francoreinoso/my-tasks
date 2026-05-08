import fs from 'node:fs/promises';
import path from 'node:path';
import { Task } from '@/domain/task/Task.js';
import type { TaskRepository } from '@/domain/task/TaskRepository.js';
import type { TaskStatus } from '@/domain/task/Task.js';

interface PersistedTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Implementación de TaskRepository que persiste a un archivo JSON con
 * escritura atómica (write-then-rename) para evitar corrupción ante caídas.
 */
export class JsonTaskRepository implements TaskRepository {
  private constructor(
    private readonly filePath: string,
    private readonly tasks: Map<string, Task>,
  ) {}

  static async load(filePath: string): Promise<JsonTaskRepository> {
    const tasks = new Map<string, Task>();

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      // Tipado parcial: dueDate puede no estar en archivos viejos.
      const data = JSON.parse(raw) as Array<Partial<PersistedTask> & {
        id: string;
        title: string;
        description: string | null;
        status: TaskStatus;
        createdAt: string;
        updatedAt: string;
      }>;
      for (const item of data) {
        const task = Task.fromPersistence({
          id: item.id,
          title: item.title,
          description: item.description,
          dueDate: item.dueDate ?? null,
          status: item.status,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        });
        tasks.set(task.id, task);
      }
    } catch (err: unknown) {
      if (!isFileNotFound(err)) throw err;
      // Archivo no existe: arrancamos vacío. La carpeta se crea en el primer save.
    }

    return new JsonTaskRepository(filePath, tasks);
  }

  findAll(): Promise<Task[]> {
    return Promise.resolve(Array.from(this.tasks.values()));
  }

  findById(id: string): Promise<Task | null> {
    return Promise.resolve(this.tasks.get(id) ?? null);
  }

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
    await this.flush();
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
    await this.flush();
  }

  private async flush(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    const serializable: PersistedTask[] = Array.from(this.tasks.values()).map((task) => {
      const snap = task.toJSON();
      return {
        id: snap.id,
        title: snap.title,
        description: snap.description,
        dueDate: snap.dueDate,
        status: snap.status,
        createdAt: snap.createdAt.toISOString(),
        updatedAt: snap.updatedAt.toISOString(),
      };
    });

    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(serializable, null, 2), 'utf-8');
    await fs.rename(tmpPath, this.filePath);
  }
}

function isFileNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 'ENOENT'
  );
}
