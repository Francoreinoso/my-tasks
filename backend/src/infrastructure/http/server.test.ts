import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './server.js';
import { InMemoryTaskRepository } from '@/infrastructure/persistence/InMemoryTaskRepository.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { InMemoryHabitCompletionRepository } from '@/infrastructure/persistence/InMemoryHabitCompletionRepository.js';

function buildApp() {
  const repo = new InMemoryTaskRepository();
  const app = createApp({
    taskRepository: repo,
    habitRepository: new InMemoryHabitRepository(),
    habitCompletionRepository: new InMemoryHabitCompletionRepository(),
    corsOrigin: 'http://localhost:5173',
  });
  return { app, repo };
}

describe('HTTP API: /api/tasks', () => {
  let app: ReturnType<typeof buildApp>['app'];

  beforeEach(() => {
    ({ app } = buildApp());
  });

  describe('GET /health', () => {
    it('responde 200 con status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/tasks', () => {
    it('devuelve [] cuando no hay tareas', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/tasks', () => {
    it('crea una tarea y la devuelve con 201', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Estudiar React' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ title: 'Estudiar React', status: 'pending' });
      expect(res.body.id).toBeTypeOf('string');
    });

    it('responde 400 si falta el título', async () => {
      const res = await request(app).post('/api/tasks').send({});
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/inválido/i);
    });

    it('responde 400 si el título excede 200 caracteres', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'x'.repeat(201) });
      expect(res.status).toBe(400);
    });

    it('acepta dueDate al crear', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Estudiar', dueDate: '2026-05-15' });
      expect(res.status).toBe(201);
      expect(res.body.dueDate).toBe('2026-05-15');
    });

    it('rechaza dueDate con formato no-ISO', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'X', dueDate: '15-05-2026' });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('actualiza una tarea existente', async () => {
      const created = await request(app).post('/api/tasks').send({ title: 'Viejo' });
      const id = created.body.id as string;

      const res = await request(app).patch(`/api/tasks/${id}`).send({ title: 'Nuevo' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Nuevo');
    });

    it('responde 404 si la tarea no existe', async () => {
      const res = await request(app)
        .patch('/api/tasks/no-existe')
        .send({ title: 'X' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('TASK_NOT_FOUND');
    });

    it('responde 400 si el body está vacío', async () => {
      const created = await request(app).post('/api/tasks').send({ title: 'X' });
      const id = created.body.id as string;

      const res = await request(app).patch(`/api/tasks/${id}`).send({});
      expect(res.status).toBe(400);
    });

    it('asigna y borra dueDate vía PATCH', async () => {
      const created = await request(app).post('/api/tasks').send({ title: 'X' });
      const id = created.body.id as string;

      const assigned = await request(app)
        .patch(`/api/tasks/${id}`)
        .send({ dueDate: '2026-05-15' });
      expect(assigned.status).toBe(200);
      expect(assigned.body.dueDate).toBe('2026-05-15');

      const cleared = await request(app)
        .patch(`/api/tasks/${id}`)
        .send({ dueDate: null });
      expect(cleared.body.dueDate).toBeNull();
    });
  });

  describe('POST /api/tasks/:id/toggle', () => {
    it('alterna el status de la tarea', async () => {
      const created = await request(app).post('/api/tasks').send({ title: 'X' });
      const id = created.body.id as string;

      const res = await request(app).post(`/api/tasks/${id}/toggle`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });

    it('responde 404 si la tarea no existe', async () => {
      const res = await request(app).post('/api/tasks/no-existe/toggle');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('elimina la tarea y responde 204', async () => {
      const created = await request(app).post('/api/tasks').send({ title: 'X' });
      const id = created.body.id as string;

      const del = await request(app).delete(`/api/tasks/${id}`);
      expect(del.status).toBe(204);

      const list = await request(app).get('/api/tasks');
      expect(list.body).toEqual([]);
    });

    it('responde 404 si la tarea no existe', async () => {
      const res = await request(app).delete('/api/tasks/no-existe');
      expect(res.status).toBe(404);
    });
  });
});
