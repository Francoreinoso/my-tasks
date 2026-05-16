import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from './server.js';
import { InMemoryTaskRepository } from '@/infrastructure/persistence/InMemoryTaskRepository.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { InMemoryHabitCompletionRepository } from '@/infrastructure/persistence/InMemoryHabitCompletionRepository.js';
import { InMemoryNoteRepository } from '@/infrastructure/persistence/InMemoryNoteRepository.js';
import { InMemoryStudyTopicRepository } from '@/infrastructure/persistence/InMemoryStudyTopicRepository.js';

function buildApp(): Express {
  return createApp({
    taskRepository: new InMemoryTaskRepository(),
    habitRepository: new InMemoryHabitRepository(),
    habitCompletionRepository: new InMemoryHabitCompletionRepository(),
    noteRepository: new InMemoryNoteRepository(),
    studyTopicRepository: new InMemoryStudyTopicRepository(),
    corsOrigin: 'http://localhost:5173',
  });
}

describe('HTTP API: /api/study', () => {
  let app: Express;

  beforeEach(() => {
    app = buildApp();
  });

  describe('GET /api/study/topics', () => {
    it('devuelve [] cuando no hay temas', async () => {
      const res = await request(app).get('/api/study/topics');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/study/topics', () => {
    it('crea un tema con título', async () => {
      const res = await request(app)
        .post('/api/study/topics')
        .send({ title: 'React' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('React');
      expect(res.body.items).toEqual([]);
      expect(res.body.links).toEqual([]);
    });

    it('rechaza con 400 si el título está vacío', async () => {
      const res = await request(app).post('/api/study/topics').send({ title: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/study/topics/:id', () => {
    it('actualiza el título', async () => {
      const created = await request(app)
        .post('/api/study/topics')
        .send({ title: 'Viejo' });

      const res = await request(app)
        .patch(`/api/study/topics/${created.body.id as string}`)
        .send({ title: 'Nuevo' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Nuevo');
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app)
        .patch('/api/study/topics/no-existe')
        .send({ title: 'x' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('STUDY_TOPIC_NOT_FOUND');
    });
  });

  describe('DELETE /api/study/topics/:id', () => {
    it('borra el tema existente', async () => {
      const created = await request(app)
        .post('/api/study/topics')
        .send({ title: 'X' });

      const del = await request(app).delete(`/api/study/topics/${created.body.id as string}`);
      expect(del.status).toBe(204);

      const get = await request(app).get(`/api/study/topics/${created.body.id as string}`);
      expect(get.status).toBe(404);
    });
  });

  describe('items endpoints', () => {
    it('flujo completo: agregar, togglear, editar, borrar', async () => {
      const topic = (
        await request(app).post('/api/study/topics').send({ title: 'React' })
      ).body;

      // add
      const afterAdd = await request(app)
        .post(`/api/study/topics/${topic.id as string}/items`)
        .send({ label: 'Hooks' });
      expect(afterAdd.status).toBe(201);
      expect(afterAdd.body.items).toHaveLength(1);
      const itemId = afterAdd.body.items[0].id as string;

      // toggle
      const afterToggle = await request(app).post(
        `/api/study/topics/${topic.id as string}/items/${itemId}/toggle`,
      );
      expect(afterToggle.status).toBe(200);
      expect(afterToggle.body.items[0].completed).toBe(true);

      // update label
      const afterUpdate = await request(app)
        .patch(`/api/study/topics/${topic.id as string}/items/${itemId}`)
        .send({ label: 'Hooks avanzados' });
      expect(afterUpdate.status).toBe(200);
      expect(afterUpdate.body.items[0].label).toBe('Hooks avanzados');

      // remove
      const afterRemove = await request(app).delete(
        `/api/study/topics/${topic.id as string}/items/${itemId}`,
      );
      expect(afterRemove.status).toBe(200);
      expect(afterRemove.body.items).toHaveLength(0);
    });

    it('responde 404 al togglear un item inexistente', async () => {
      const topic = (
        await request(app).post('/api/study/topics').send({ title: 'X' })
      ).body;

      const res = await request(app).post(
        `/api/study/topics/${topic.id as string}/items/no-existe/toggle`,
      );
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('STUDY_ITEM_NOT_FOUND');
    });
  });

  describe('links endpoints', () => {
    it('flujo completo: agregar, editar, borrar', async () => {
      const topic = (
        await request(app).post('/api/study/topics').send({ title: 'React' })
      ).body;

      // add
      const afterAdd = await request(app)
        .post(`/api/study/topics/${topic.id as string}/links`)
        .send({ label: 'Curso', url: 'https://example.com' });
      expect(afterAdd.status).toBe(201);
      const linkId = afterAdd.body.links[0].id as string;

      // update
      const afterUpdate = await request(app)
        .patch(`/api/study/topics/${topic.id as string}/links/${linkId}`)
        .send({ url: 'https://new.com' });
      expect(afterUpdate.status).toBe(200);
      expect(afterUpdate.body.links[0].url).toBe('https://new.com');

      // remove
      const afterRemove = await request(app).delete(
        `/api/study/topics/${topic.id as string}/links/${linkId}`,
      );
      expect(afterRemove.status).toBe(200);
      expect(afterRemove.body.links).toHaveLength(0);
    });

    it('rechaza con 400 URL inválida', async () => {
      const topic = (
        await request(app).post('/api/study/topics').send({ title: 'X' })
      ).body;

      const res = await request(app)
        .post(`/api/study/topics/${topic.id as string}/links`)
        .send({ label: 'lbl', url: 'no-es-url' });
      expect(res.status).toBe(400);
    });
  });
});
