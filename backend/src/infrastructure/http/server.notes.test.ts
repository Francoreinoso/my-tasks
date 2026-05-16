import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from './server.js';
import { InMemoryTaskRepository } from '@/infrastructure/persistence/InMemoryTaskRepository.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { InMemoryHabitCompletionRepository } from '@/infrastructure/persistence/InMemoryHabitCompletionRepository.js';
import { InMemoryNoteRepository } from '@/infrastructure/persistence/InMemoryNoteRepository.js';

function buildApp(): Express {
  return createApp({
    taskRepository: new InMemoryTaskRepository(),
    habitRepository: new InMemoryHabitRepository(),
    habitCompletionRepository: new InMemoryHabitCompletionRepository(),
    noteRepository: new InMemoryNoteRepository(),
    corsOrigin: 'http://localhost:5173',
  });
}

describe('HTTP API: /api/notes', () => {
  let app: Express;

  beforeEach(() => {
    app = buildApp();
  });

  describe('GET /api/notes', () => {
    it('devuelve [] cuando no hay notas', async () => {
      const res = await request(app).get('/api/notes');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('lista todas las notas ordenadas por updatedAt desc', async () => {
      await request(app).post('/api/notes').send({ title: 'Primera', content: 'a' });
      await new Promise((r) => setTimeout(r, 5));
      await request(app).post('/api/notes').send({ title: 'Segunda', content: 'b' });

      const res = await request(app).get('/api/notes');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].title).toBe('Segunda');
      expect(res.body[1].title).toBe('Primera');
    });
  });

  describe('POST /api/notes', () => {
    it('crea una nota con título y contenido', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ title: 'Compras', content: '- pan' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Compras');
      expect(res.body.content).toBe('- pan');
      expect(res.body.id).toBeTypeOf('string');
    });

    it('acepta nota solo con contenido (sin título)', async () => {
      const res = await request(app).post('/api/notes').send({ content: 'algo' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBeNull();
    });

    it('rechaza con 400 si título y contenido están ambos vacíos', async () => {
      const res = await request(app).post('/api/notes').send({});
      expect(res.status).toBe(400);
    });

    it('rechaza con 400 si el título supera 200 caracteres', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ title: 'a'.repeat(201), content: 'x' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/notes/:id', () => {
    it('devuelve la nota si existe', async () => {
      const created = await request(app)
        .post('/api/notes')
        .send({ title: 'X', content: 'y' });

      const res = await request(app).get(`/api/notes/${created.body.id as string}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.body.id);
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).get('/api/notes/no-existe');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOTE_NOT_FOUND');
    });
  });

  describe('PATCH /api/notes/:id', () => {
    it('actualiza título y contenido', async () => {
      const created = await request(app)
        .post('/api/notes')
        .send({ title: 'Viejo', content: 'a' });

      const res = await request(app)
        .patch(`/api/notes/${created.body.id as string}`)
        .send({ title: 'Nuevo', content: 'b' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Nuevo');
      expect(res.body.content).toBe('b');
    });

    it('permite limpiar el título si hay contenido', async () => {
      const created = await request(app)
        .post('/api/notes')
        .send({ title: 'X', content: 'preservar' });

      const res = await request(app)
        .patch(`/api/notes/${created.body.id as string}`)
        .send({ title: null });

      expect(res.status).toBe(200);
      expect(res.body.title).toBeNull();
    });

    it('rechaza con 400 si el body está vacío', async () => {
      const created = await request(app)
        .post('/api/notes')
        .send({ title: 'X', content: 'y' });

      const res = await request(app)
        .patch(`/api/notes/${created.body.id as string}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).patch('/api/notes/no-existe').send({ title: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('borra la nota existente', async () => {
      const created = await request(app)
        .post('/api/notes')
        .send({ title: 'X', content: 'y' });

      const del = await request(app).delete(`/api/notes/${created.body.id as string}`);
      expect(del.status).toBe(204);

      const get = await request(app).get(`/api/notes/${created.body.id as string}`);
      expect(get.status).toBe(404);
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).delete('/api/notes/no-existe');
      expect(res.status).toBe(404);
    });
  });
});
