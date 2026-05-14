import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { JsonHabitRepository } from './JsonHabitRepository.js';
import { Habit } from '@/domain/habit/Habit.js';

describe('JsonHabitRepository (integración con filesystem)', () => {
  let tmpDir: string;
  let dbPath: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'my-tasks-habit-test-'));
    dbPath = path.join(tmpDir, 'habits.json');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('arranca vacío cuando el archivo no existe', async () => {
    const repo = await JsonHabitRepository.load(dbPath);
    expect(await repo.findAll()).toEqual([]);
  });

  it('persiste un hábito a disco al guardar', async () => {
    const repo = await JsonHabitRepository.load(dbPath);
    await repo.save(Habit.create({ name: 'Entrenar' }));

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ name: string }>;
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.name).toBe('Entrenar');
  });

  it('restaura hábitos desde disco al recargar el repo', async () => {
    const repo1 = await JsonHabitRepository.load(dbPath);
    const habit = Habit.create({
      name: 'Estudiar',
      description: '30 min',
      frequency: { kind: 'weekdays' },
    });
    await repo1.save(habit);

    const repo2 = await JsonHabitRepository.load(dbPath);
    const restored = await repo2.findById(habit.id);

    expect(restored).not.toBeNull();
    expect(restored?.name).toBe('Estudiar');
    expect(restored?.description).toBe('30 min');
    expect(restored?.frequency).toEqual({ kind: 'weekdays' });
    expect(restored?.createdAt).toBeInstanceOf(Date);
    expect(restored?.createdAt.getTime()).toBe(habit.createdAt.getTime());
  });

  it('elimina un hábito del disco', async () => {
    const repo = await JsonHabitRepository.load(dbPath);
    const habit = Habit.create({ name: 'X' });
    await repo.save(habit);
    await repo.delete(habit.id);

    const repo2 = await JsonHabitRepository.load(dbPath);
    expect(await repo2.findAll()).toEqual([]);
  });

  it('crea automáticamente el directorio padre si no existe', async () => {
    const nestedPath = path.join(tmpDir, 'nested', 'deep', 'habits.json');
    const repo = await JsonHabitRepository.load(nestedPath);
    await repo.save(Habit.create({ name: 'X' }));

    const stat = await fs.stat(nestedPath);
    expect(stat.isFile()).toBe(true);
  });

  it('no deja archivo .tmp residual después de un save (write atómico)', async () => {
    const repo = await JsonHabitRepository.load(dbPath);
    await repo.save(Habit.create({ name: 'X' }));

    const tmpFile = `${dbPath}.tmp`;
    const exists = await fs
      .access(tmpFile)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  it('serializa fechas como ISO strings en el JSON', async () => {
    const repo = await JsonHabitRepository.load(dbPath);
    await repo.save(Habit.create({ name: 'X' }));

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ createdAt: string; updatedAt: string }>;
    expect(parsed[0]?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(parsed[0]?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('mantiene archivedAt al recargar', async () => {
    const repo1 = await JsonHabitRepository.load(dbPath);
    const habit = Habit.create({ name: 'X' }).archive();
    await repo1.save(habit);

    const repo2 = await JsonHabitRepository.load(dbPath);
    const restored = await repo2.findById(habit.id);
    expect(restored?.archivedAt).toBeInstanceOf(Date);
    expect(restored?.isArchived).toBe(true);
  });

  it('persiste frequency custom con su lista de días', async () => {
    const repo = await JsonHabitRepository.load(dbPath);
    const habit = Habit.create({
      name: 'X',
      frequency: { kind: 'custom', days: [1, 3, 5] },
    });
    await repo.save(habit);

    const repo2 = await JsonHabitRepository.load(dbPath);
    const restored = await repo2.findById(habit.id);
    expect(restored?.frequency).toEqual({ kind: 'custom', days: [1, 3, 5] });
  });

  it('actualizar un hábito reemplaza la versión anterior (no duplica)', async () => {
    const repo = await JsonHabitRepository.load(dbPath);
    const habit = Habit.create({ name: 'Original' });
    await repo.save(habit);
    await repo.save(habit.updateName('Cambiado'));

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.name).toBe('Cambiado');
  });
});
