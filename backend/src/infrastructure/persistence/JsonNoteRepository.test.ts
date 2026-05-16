import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { JsonNoteRepository } from './JsonNoteRepository.js';
import { Note } from '@/domain/note/Note.js';

describe('JsonNoteRepository (integración con filesystem)', () => {
  let tmpDir: string;
  let dbPath: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'my-tasks-note-test-'));
    dbPath = path.join(tmpDir, 'notes.json');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('arranca vacío cuando el archivo no existe', async () => {
    const repo = await JsonNoteRepository.load(dbPath);
    expect(await repo.findAll()).toEqual([]);
  });

  it('persiste una nota a disco al guardar', async () => {
    const repo = await JsonNoteRepository.load(dbPath);
    await repo.save(Note.create({ title: 'Compras', content: '- pan' }));

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ title: string }>;
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.title).toBe('Compras');
  });

  it('restaura notas desde disco al recargar', async () => {
    const repo1 = await JsonNoteRepository.load(dbPath);
    const note = Note.create({ title: 'Ideas', content: 'línea1\nlínea2' });
    await repo1.save(note);

    const repo2 = await JsonNoteRepository.load(dbPath);
    const restored = await repo2.findById(note.id);

    expect(restored).not.toBeNull();
    expect(restored?.title).toBe('Ideas');
    expect(restored?.content).toBe('línea1\nlínea2');
    expect(restored?.createdAt).toBeInstanceOf(Date);
    expect(restored?.createdAt.getTime()).toBe(note.createdAt.getTime());
  });

  it('persiste y restaura una nota sin título', async () => {
    const repo1 = await JsonNoteRepository.load(dbPath);
    const note = Note.create({ title: null, content: 'solo contenido' });
    await repo1.save(note);

    const repo2 = await JsonNoteRepository.load(dbPath);
    const restored = await repo2.findById(note.id);
    expect(restored?.title).toBeNull();
    expect(restored?.content).toBe('solo contenido');
  });

  it('persiste y restaura una nota sin contenido', async () => {
    const repo1 = await JsonNoteRepository.load(dbPath);
    const note = Note.create({ title: 'Solo título', content: null });
    await repo1.save(note);

    const repo2 = await JsonNoteRepository.load(dbPath);
    const restored = await repo2.findById(note.id);
    expect(restored?.title).toBe('Solo título');
    expect(restored?.content).toBeNull();
  });

  it('elimina una nota del disco', async () => {
    const repo = await JsonNoteRepository.load(dbPath);
    const note = Note.create({ title: 'X', content: 'y' });
    await repo.save(note);
    await repo.delete(note.id);

    const repo2 = await JsonNoteRepository.load(dbPath);
    expect(await repo2.findAll()).toEqual([]);
  });

  it('crea automáticamente el directorio padre si no existe', async () => {
    const nestedPath = path.join(tmpDir, 'nested', 'deep', 'notes.json');
    const repo = await JsonNoteRepository.load(nestedPath);
    await repo.save(Note.create({ title: 'X', content: 'y' }));

    const stat = await fs.stat(nestedPath);
    expect(stat.isFile()).toBe(true);
  });

  it('no deja archivo .tmp residual después de un save (write atómico)', async () => {
    const repo = await JsonNoteRepository.load(dbPath);
    await repo.save(Note.create({ title: 'X', content: 'y' }));

    const tmpFile = `${dbPath}.tmp`;
    const exists = await fs
      .access(tmpFile)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  it('serializa fechas como ISO strings en el JSON', async () => {
    const repo = await JsonNoteRepository.load(dbPath);
    await repo.save(Note.create({ title: 'X', content: 'y' }));

    const raw = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Array<{ createdAt: string; updatedAt: string }>;
    expect(parsed[0]?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(parsed[0]?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('actualizar una nota reemplaza la versión anterior (no duplica)', async () => {
    const repo = await JsonNoteRepository.load(dbPath);
    const note = Note.create({ title: 'Original', content: 'x' });
    await repo.save(note);
    await repo.save(note.updateTitle('Cambiado'));

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.title).toBe('Cambiado');
  });
});
