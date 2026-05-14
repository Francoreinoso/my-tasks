import fs from 'node:fs/promises';
import path from 'node:path';
import { Habit } from '@/domain/habit/Habit.js';
import type { HabitFrequency } from '@/domain/habit/Habit.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';

interface PersistedHabit {
  id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

/**
 * Persistencia JSON con escritura atómica (write-then-rename) para evitar
 * corrupción ante caídas durante el flush.
 */
export class JsonHabitRepository implements HabitRepository {
  private constructor(
    private readonly filePath: string,
    private readonly habits: Map<string, Habit>,
  ) {}

  static async load(filePath: string): Promise<JsonHabitRepository> {
    const habits = new Map<string, Habit>();

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw) as PersistedHabit[];
      for (const item of data) {
        const habit = Habit.fromPersistence({
          id: item.id,
          name: item.name,
          description: item.description,
          frequency: item.frequency,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          archivedAt: item.archivedAt ? new Date(item.archivedAt) : null,
        });
        habits.set(habit.id, habit);
      }
    } catch (err: unknown) {
      if (!isFileNotFound(err)) throw err;
    }

    return new JsonHabitRepository(filePath, habits);
  }

  findAll(): Promise<Habit[]> {
    return Promise.resolve(Array.from(this.habits.values()));
  }

  findById(id: string): Promise<Habit | null> {
    return Promise.resolve(this.habits.get(id) ?? null);
  }

  async save(habit: Habit): Promise<void> {
    this.habits.set(habit.id, habit);
    await this.flush();
  }

  async delete(id: string): Promise<void> {
    this.habits.delete(id);
    await this.flush();
  }

  private async flush(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    const serializable: PersistedHabit[] = Array.from(this.habits.values()).map(
      (habit) => {
        const snap = habit.toJSON();
        return {
          id: snap.id,
          name: snap.name,
          description: snap.description,
          frequency: snap.frequency,
          createdAt: snap.createdAt.toISOString(),
          updatedAt: snap.updatedAt.toISOString(),
          archivedAt: snap.archivedAt ? snap.archivedAt.toISOString() : null,
        };
      },
    );

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
