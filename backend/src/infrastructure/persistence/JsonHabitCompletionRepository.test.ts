import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { JsonHabitCompletionRepository } from './JsonHabitCompletionRepository.js';
import { HabitCompletion } from '@/domain/habit/HabitCompletion.js';

describe('JsonHabitCompletionRepository (integración con filesystem)', () => {
  let tmpDir: string;
  let dbPath: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'my-tasks-completion-test-'));
    dbPath = path.join(tmpDir, 'habit-completions.json');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('arranca vacío cuando el archivo no existe', async () => {
    const repo = await JsonHabitCompletionRepository.load(dbPath);
    expect(await repo.findByHabitInRange('h1', '2026-01-01', '2026-12-31')).toEqual([]);
  });

  it('persiste y restaura completions desde disco', async () => {
    const repo1 = await JsonHabitCompletionRepository.load(dbPath);
    const completion = HabitCompletion.create({
      habitId: 'h1',
      date: '2026-05-14',
    });
    await repo1.save(completion);

    const repo2 = await JsonHabitCompletionRepository.load(dbPath);
    const restored = await repo2.findById(completion.id);

    expect(restored).not.toBeNull();
    expect(restored?.habitId).toBe('h1');
    expect(restored?.date).toBe('2026-05-14');
    expect(restored?.createdAt).toBeInstanceOf(Date);
  });

  describe('findByHabitAndDate', () => {
    it('encuentra la completion exacta por habitId + date', async () => {
      const repo = await JsonHabitCompletionRepository.load(dbPath);
      const c = HabitCompletion.create({ habitId: 'h1', date: '2026-05-14' });
      await repo.save(c);

      const found = await repo.findByHabitAndDate('h1', '2026-05-14');
      expect(found?.id).toBe(c.id);
    });

    it('devuelve null si no hay coincidencia', async () => {
      const repo = await JsonHabitCompletionRepository.load(dbPath);
      await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-14' }));

      expect(await repo.findByHabitAndDate('h1', '2026-05-15')).toBeNull();
      expect(await repo.findByHabitAndDate('h2', '2026-05-14')).toBeNull();
    });
  });

  describe('findByHabitInRange', () => {
    it('retorna solo las completions del hábito y dentro del rango (inclusive)', async () => {
      const repo = await JsonHabitCompletionRepository.load(dbPath);
      await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-10' }));
      await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-14' }));
      await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-20' }));
      // Otro hábito en el mismo rango: debe quedar fuera
      await repo.save(HabitCompletion.create({ habitId: 'h2', date: '2026-05-12' }));

      const result = await repo.findByHabitInRange('h1', '2026-05-11', '2026-05-15');

      expect(result).toHaveLength(1);
      expect(result[0]?.date).toBe('2026-05-14');
    });

    it('los bordes son inclusivos', async () => {
      const repo = await JsonHabitCompletionRepository.load(dbPath);
      await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-10' }));
      await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-20' }));

      const result = await repo.findByHabitInRange('h1', '2026-05-10', '2026-05-20');
      expect(result).toHaveLength(2);
    });

    it('rango sin coincidencias devuelve array vacío', async () => {
      const repo = await JsonHabitCompletionRepository.load(dbPath);
      await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-10' }));

      const result = await repo.findByHabitInRange('h1', '2026-06-01', '2026-06-30');
      expect(result).toEqual([]);
    });
  });

  it('elimina por id y persiste el cambio a disco', async () => {
    const repo = await JsonHabitCompletionRepository.load(dbPath);
    const c = HabitCompletion.create({ habitId: 'h1', date: '2026-05-14' });
    await repo.save(c);
    await repo.delete(c.id);

    const repo2 = await JsonHabitCompletionRepository.load(dbPath);
    expect(await repo2.findById(c.id)).toBeNull();
  });

  it('crea automáticamente el directorio padre si no existe', async () => {
    const nestedPath = path.join(tmpDir, 'nested', 'deep', 'completions.json');
    const repo = await JsonHabitCompletionRepository.load(nestedPath);
    await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-14' }));

    const stat = await fs.stat(nestedPath);
    expect(stat.isFile()).toBe(true);
  });

  it('no deja archivo .tmp residual después de un save (write atómico)', async () => {
    const repo = await JsonHabitCompletionRepository.load(dbPath);
    await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-14' }));

    const tmpFile = `${dbPath}.tmp`;
    const exists = await fs
      .access(tmpFile)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  it('serializa createdAt como ISO string', async () => {
    const repo = await JsonHabitCompletionRepository.load(dbPath);
    await repo.save(HabitCompletion.create({ habitId: 'h1', date: '2026-05-14' }));

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ createdAt: string }>;
    expect(parsed[0]?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
