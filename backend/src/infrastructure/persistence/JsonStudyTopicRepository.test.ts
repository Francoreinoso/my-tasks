import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { JsonStudyTopicRepository } from './JsonStudyTopicRepository.js';
import { StudyTopic } from '@/domain/study/StudyTopic.js';

describe('JsonStudyTopicRepository (integración con filesystem)', () => {
  let tmpDir: string;
  let dbPath: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'my-tasks-study-test-'));
    dbPath = path.join(tmpDir, 'study.json');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('arranca vacío cuando el archivo no existe', async () => {
    const repo = await JsonStudyTopicRepository.load(dbPath);
    expect(await repo.findAll()).toEqual([]);
  });

  it('persiste un tema vacío a disco', async () => {
    const repo = await JsonStudyTopicRepository.load(dbPath);
    await repo.save(StudyTopic.create({ title: 'React' }));

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ title: string }>;
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.title).toBe('React');
  });

  it('persiste y restaura un tema con items y links', async () => {
    const repo1 = await JsonStudyTopicRepository.load(dbPath);
    const topic = StudyTopic.create({ title: 'React' })
      .addItem('Hooks')
      .addItem('JSX')
      .addLink('Curso', 'https://example.com');
    await repo1.save(topic);

    const repo2 = await JsonStudyTopicRepository.load(dbPath);
    const restored = await repo2.findById(topic.id);

    expect(restored).not.toBeNull();
    expect(restored?.title).toBe('React');
    expect(restored?.items).toHaveLength(2);
    expect(restored?.items[0]?.label).toBe('Hooks');
    expect(restored?.links).toHaveLength(1);
    expect(restored?.links[0]?.url).toBe('https://example.com');
  });

  it('mantiene el estado completed de items al recargar', async () => {
    const repo1 = await JsonStudyTopicRepository.load(dbPath);
    const initial = StudyTopic.create({ title: 'X' }).addItem('uno');
    const item = initial.items[0];
    if (!item) throw new Error('test fixture');
    const toggled = initial.toggleItem(item.id);
    await repo1.save(toggled);

    const repo2 = await JsonStudyTopicRepository.load(dbPath);
    const restored = await repo2.findById(toggled.id);
    expect(restored?.items[0]?.completed).toBe(true);
  });

  it('elimina un tema del disco', async () => {
    const repo = await JsonStudyTopicRepository.load(dbPath);
    const topic = StudyTopic.create({ title: 'X' });
    await repo.save(topic);
    await repo.delete(topic.id);

    const repo2 = await JsonStudyTopicRepository.load(dbPath);
    expect(await repo2.findAll()).toEqual([]);
  });

  it('crea automáticamente el directorio padre si no existe', async () => {
    const nestedPath = path.join(tmpDir, 'nested', 'deep', 'study.json');
    const repo = await JsonStudyTopicRepository.load(nestedPath);
    await repo.save(StudyTopic.create({ title: 'X' }));

    const stat = await fs.stat(nestedPath);
    expect(stat.isFile()).toBe(true);
  });

  it('no deja archivo .tmp residual después de un save (write atómico)', async () => {
    const repo = await JsonStudyTopicRepository.load(dbPath);
    await repo.save(StudyTopic.create({ title: 'X' }));

    const tmpFile = `${dbPath}.tmp`;
    const exists = await fs
      .access(tmpFile)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  it('serializa fechas como ISO strings en el JSON', async () => {
    const repo = await JsonStudyTopicRepository.load(dbPath);
    await repo.save(StudyTopic.create({ title: 'X' }));

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ createdAt: string; updatedAt: string }>;
    expect(parsed[0]?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(parsed[0]?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('actualizar un tema reemplaza la versión anterior (no duplica)', async () => {
    const repo = await JsonStudyTopicRepository.load(dbPath);
    const topic = StudyTopic.create({ title: 'Original' });
    await repo.save(topic);
    await repo.save(topic.updateTitle('Cambiado'));

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.title).toBe('Cambiado');
  });
});
