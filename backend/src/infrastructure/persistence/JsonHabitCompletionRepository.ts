import fs from 'node:fs/promises';
import path from 'node:path';
import { HabitCompletion } from '@/domain/habit/HabitCompletion.js';
import type { HabitCompletionRepository } from '@/domain/habit/HabitCompletionRepository.js';

interface PersistedHabitCompletion {
  id: string;
  habitId: string;
  date: string;
  createdAt: string;
}

/**
 * Persistencia JSON para completions con escritura atómica.
 * Las queries por rango usan comparación lexicográfica de strings ISO
 * (YYYY-MM-DD), que coincide con el orden cronológico.
 */
export class JsonHabitCompletionRepository implements HabitCompletionRepository {
  private constructor(
    private readonly filePath: string,
    private readonly completions: Map<string, HabitCompletion>,
  ) {}

  static async load(filePath: string): Promise<JsonHabitCompletionRepository> {
    const completions = new Map<string, HabitCompletion>();

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw) as PersistedHabitCompletion[];
      for (const item of data) {
        const completion = HabitCompletion.fromPersistence({
          id: item.id,
          habitId: item.habitId,
          date: item.date,
          createdAt: new Date(item.createdAt),
        });
        completions.set(completion.id, completion);
      }
    } catch (err: unknown) {
      if (!isFileNotFound(err)) throw err;
    }

    return new JsonHabitCompletionRepository(filePath, completions);
  }

  findById(id: string): Promise<HabitCompletion | null> {
    return Promise.resolve(this.completions.get(id) ?? null);
  }

  findByHabitAndDate(habitId: string, date: string): Promise<HabitCompletion | null> {
    for (const c of this.completions.values()) {
      if (c.habitId === habitId && c.date === date) {
        return Promise.resolve(c);
      }
    }
    return Promise.resolve(null);
  }

  findByHabitInRange(
    habitId: string,
    from: string,
    to: string,
  ): Promise<HabitCompletion[]> {
    const result: HabitCompletion[] = [];
    for (const c of this.completions.values()) {
      if (c.habitId === habitId && c.date >= from && c.date <= to) {
        result.push(c);
      }
    }
    return Promise.resolve(result);
  }

  async save(completion: HabitCompletion): Promise<void> {
    this.completions.set(completion.id, completion);
    await this.flush();
  }

  async delete(id: string): Promise<void> {
    this.completions.delete(id);
    await this.flush();
  }

  async deleteAllByHabit(habitId: string): Promise<void> {
    let changed = false;
    for (const [id, c] of this.completions.entries()) {
      if (c.habitId === habitId) {
        this.completions.delete(id);
        changed = true;
      }
    }
    if (changed) await this.flush();
  }

  private async flush(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    const serializable: PersistedHabitCompletion[] = Array.from(
      this.completions.values(),
    ).map((c) => {
      const snap = c.toJSON();
      return {
        id: snap.id,
        habitId: snap.habitId,
        date: snap.date,
        createdAt: snap.createdAt.toISOString(),
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
