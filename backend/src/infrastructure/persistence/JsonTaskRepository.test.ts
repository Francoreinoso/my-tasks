import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { JsonTaskRepository } from './JsonTaskRepository.js';
import { Task } from '@/domain/task/Task.js';

describe('JsonTaskRepository (integración con filesystem)', () => {
  let tmpDir: string;
  let dbPath: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'my-tasks-test-'));
    dbPath = path.join(tmpDir, 'tasks.json');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('arranca vacío cuando el archivo no existe', async () => {
    const repo = await JsonTaskRepository.load(dbPath);
    expect(await repo.findAll()).toEqual([]);
  });

  it('persiste una tarea a disco al guardar', async () => {
    const repo = await JsonTaskRepository.load(dbPath);
    const task = Task.create({ title: 'Estudiar' });

    await repo.save(task);

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ title: string }>;
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.title).toBe('Estudiar');
  });

  it('restaura tareas desde disco al recargar el repo', async () => {
    const repo1 = await JsonTaskRepository.load(dbPath);
    const task = Task.create({ title: 'Persistente', description: 'detalles' });
    await repo1.save(task);

    const repo2 = await JsonTaskRepository.load(dbPath);
    const restored = await repo2.findById(task.id);

    expect(restored).not.toBeNull();
    expect(restored?.title).toBe('Persistente');
    expect(restored?.description).toBe('detalles');
    expect(restored?.createdAt).toBeInstanceOf(Date);
    expect(restored?.createdAt.getTime()).toBe(task.createdAt.getTime());
  });

  it('elimina una tarea del disco', async () => {
    const repo = await JsonTaskRepository.load(dbPath);
    const task = Task.create({ title: 'X' });
    await repo.save(task);
    await repo.delete(task.id);

    const repo2 = await JsonTaskRepository.load(dbPath);
    expect(await repo2.findAll()).toEqual([]);
  });

  it('crea automáticamente el directorio padre si no existe', async () => {
    const nestedPath = path.join(tmpDir, 'nested', 'deep', 'tasks.json');
    const repo = await JsonTaskRepository.load(nestedPath);
    await repo.save(Task.create({ title: 'X' }));

    const stat = await fs.stat(nestedPath);
    expect(stat.isFile()).toBe(true);
  });

  it('no deja archivo .tmp residual después de un save (write atómico)', async () => {
    const repo = await JsonTaskRepository.load(dbPath);
    await repo.save(Task.create({ title: 'X' }));

    const tmpFile = `${dbPath}.tmp`;
    const exists = await fs
      .access(tmpFile)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  it('serializa fechas como ISO strings en el JSON', async () => {
    const repo = await JsonTaskRepository.load(dbPath);
    await repo.save(Task.create({ title: 'X' }));

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ createdAt: string; updatedAt: string }>;
    expect(parsed[0]?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(parsed[0]?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('mantiene el estado completed al recargar', async () => {
    const repo1 = await JsonTaskRepository.load(dbPath);
    const task = Task.create({ title: 'X' });
    await repo1.save(task.complete());

    const repo2 = await JsonTaskRepository.load(dbPath);
    const restored = await repo2.findById(task.id);
    expect(restored?.status).toBe('completed');
  });

  it('actualizar una tarea reemplaza la versión anterior (no duplica)', async () => {
    const repo = await JsonTaskRepository.load(dbPath);
    const task = Task.create({ title: 'Original' });
    await repo.save(task);
    await repo.save(task.updateTitle('Cambiado'));

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.title).toBe('Cambiado');
  });

  it('lee correctamente JSONs viejos sin el campo dueDate (backwards compat)', async () => {
    // Simulamos un tasks.json escrito antes de agregar dueDate
    const legacyJson = JSON.stringify([
      {
        id: 'legacy-1',
        title: 'Tarea legacy',
        description: null,
        status: 'pending',
        createdAt: '2026-04-01T10:00:00.000Z',
        updatedAt: '2026-04-01T10:00:00.000Z',
      },
    ]);
    await fs.writeFile(dbPath, legacyJson);

    const repo = await JsonTaskRepository.load(dbPath);
    const task = await repo.findById('legacy-1');

    expect(task).not.toBeNull();
    expect(task?.dueDate).toBeNull();
  });

  it('persiste dueDate al guardar', async () => {
    const repo = await JsonTaskRepository.load(dbPath);
    await repo.save(Task.create({ title: 'X', dueDate: '2026-05-15' }));

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ dueDate: string | null }>;
    expect(parsed[0]?.dueDate).toBe('2026-05-15');
  });
});
