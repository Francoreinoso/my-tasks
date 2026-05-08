import { describe, it, expect } from 'vitest';
import { listTasks } from './listTasks.js';
import { createTask } from './createTask.js';
import { InMemoryTaskRepository } from '@/infrastructure/persistence/InMemoryTaskRepository.js';

describe('listTasks', () => {
  it('devuelve un arreglo vacío cuando no hay tareas', async () => {
    const repo = new InMemoryTaskRepository();
    expect(await listTasks(repo)).toEqual([]);
  });

  it('devuelve todas las tareas guardadas', async () => {
    const repo = new InMemoryTaskRepository();
    await createTask(repo, { title: 'A' });
    await createTask(repo, { title: 'B' });

    const all = await listTasks(repo);
    expect(all).toHaveLength(2);
    expect(all.map((t) => t.title).sort()).toEqual(['A', 'B']);
  });
});
