import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from './server.js';
import { InMemoryTaskRepository } from '@/infrastructure/persistence/InMemoryTaskRepository.js';
import { InMemoryHabitRepository } from '@/infrastructure/persistence/InMemoryHabitRepository.js';
import { InMemoryHabitCompletionRepository } from '@/infrastructure/persistence/InMemoryHabitCompletionRepository.js';

function buildApp(): Express {
  return createApp({
    taskRepository: new InMemoryTaskRepository(),
    habitRepository: new InMemoryHabitRepository(),
    habitCompletionRepository: new InMemoryHabitCompletionRepository(),
    corsOrigin: 'http://localhost:5173',
  });
}

describe('HTTP API: /api/habits', () => {
  let app: Express;

  beforeEach(() => {
    app = buildApp();
  });

  describe('GET /api/habits', () => {
    it('devuelve [] cuando no hay hábitos', async () => {
      const res = await request(app).get('/api/habits');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('?archived=true devuelve solo archivados; sin query devuelve activos', async () => {
      const activo = await request(app).post('/api/habits').send({ name: 'Activo' });
      const archivar = await request(app).post('/api/habits').send({ name: 'Archivar' });
      await request(app).post(`/api/habits/${archivar.body.id as string}/archive`);

      const activos = await request(app).get('/api/habits');
      expect(activos.body).toHaveLength(1);
      expect(activos.body[0].id).toBe(activo.body.id);

      const archivados = await request(app).get('/api/habits?archived=true');
      expect(archivados.body).toHaveLength(1);
      expect(archivados.body[0].id).toBe(archivar.body.id);
    });
  });

  describe('POST /api/habits', () => {
    it('crea un hábito con nombre y frecuencia daily por defecto', async () => {
      const res = await request(app).post('/api/habits').send({ name: 'Entrenar' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Entrenar',
        frequency: { kind: 'daily' },
      });
      expect(res.body.id).toBeTypeOf('string');
    });

    it('acepta frequency custom con días', async () => {
      const res = await request(app)
        .post('/api/habits')
        .send({ name: 'Gym', frequency: { kind: 'custom', days: [1, 3, 5] } });

      expect(res.status).toBe(201);
      expect(res.body.frequency).toEqual({ kind: 'custom', days: [1, 3, 5] });
    });

    it('responde 400 si falta el nombre', async () => {
      const res = await request(app).post('/api/habits').send({});
      expect(res.status).toBe(400);
    });

    it('responde 400 si frequency custom no tiene días', async () => {
      const res = await request(app)
        .post('/api/habits')
        .send({ name: 'X', frequency: { kind: 'custom', days: [] } });
      expect(res.status).toBe(400);
    });

    it('responde 400 si frequency custom tiene un día fuera de rango', async () => {
      const res = await request(app)
        .post('/api/habits')
        .send({ name: 'X', frequency: { kind: 'custom', days: [7] } });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/habits/:id', () => {
    it('devuelve el hábito por id', async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      const id = created.body.id as string;

      const res = await request(app).get(`/api/habits/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).get('/api/habits/no-existe');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('HABIT_NOT_FOUND');
    });
  });

  describe('PATCH /api/habits/:id', () => {
    it('actualiza name y frequency', async () => {
      const created = await request(app).post('/api/habits').send({ name: 'Viejo' });
      const id = created.body.id as string;

      const res = await request(app)
        .patch(`/api/habits/${id}`)
        .send({ name: 'Nuevo', frequency: { kind: 'weekdays' } });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Nuevo');
      expect(res.body.frequency).toEqual({ kind: 'weekdays' });
    });

    it('responde 400 si el body está vacío', async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      const id = created.body.id as string;
      const res = await request(app).patch(`/api/habits/${id}`).send({});
      expect(res.status).toBe(400);
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app)
        .patch('/api/habits/no-existe')
        .send({ name: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/habits/:id/archive y /unarchive', () => {
    it('archiva y restaura un hábito', async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      const id = created.body.id as string;

      const archived = await request(app).post(`/api/habits/${id}/archive`);
      expect(archived.status).toBe(200);
      expect(archived.body.archivedAt).not.toBeNull();

      const restored = await request(app).post(`/api/habits/${id}/unarchive`);
      expect(restored.status).toBe(200);
      expect(restored.body.archivedAt).toBeNull();
    });

    it('responde 404 si el hábito no existe', async () => {
      const res = await request(app).post('/api/habits/no-existe/archive');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/habits/:id (cascade)', () => {
    it('borra el hábito y sus completions', async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      const id = created.body.id as string;

      await request(app).post(`/api/habits/${id}/completions`).send({ date: '2026-05-10' });
      await request(app).post(`/api/habits/${id}/completions`).send({ date: '2026-05-11' });

      const del = await request(app).delete(`/api/habits/${id}`);
      expect(del.status).toBe(204);

      const list = await request(app).get('/api/habits');
      expect(list.body).toEqual([]);
    });
  });

  describe('POST /api/habits/:id/completions (marcar día)', () => {
    let habitId: string;

    beforeEach(async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      habitId = created.body.id as string;
    });

    it('marca un día y devuelve la completion con 201', async () => {
      const res = await request(app)
        .post(`/api/habits/${habitId}/completions`)
        .send({ date: '2026-05-14' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ habitId, date: '2026-05-14' });
    });

    it('es idempotente: marcar el mismo día devuelve la misma completion', async () => {
      const first = await request(app)
        .post(`/api/habits/${habitId}/completions`)
        .send({ date: '2026-05-14' });
      const second = await request(app)
        .post(`/api/habits/${habitId}/completions`)
        .send({ date: '2026-05-14' });

      expect(second.body.id).toBe(first.body.id);
    });

    it('responde 409 si el hábito está archivado', async () => {
      await request(app).post(`/api/habits/${habitId}/archive`);
      const res = await request(app)
        .post(`/api/habits/${habitId}/completions`)
        .send({ date: '2026-05-14' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('HABIT_ARCHIVED');
    });

    it('responde 400 si date está mal formado', async () => {
      const res = await request(app)
        .post(`/api/habits/${habitId}/completions`)
        .send({ date: '14-05-2026' });

      expect(res.status).toBe(400);
    });

    it('responde 404 si el hábito no existe', async () => {
      const res = await request(app)
        .post('/api/habits/no-existe/completions')
        .send({ date: '2026-05-14' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/habits/:id/completions (desmarcar día)', () => {
    let habitId: string;

    beforeEach(async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      habitId = created.body.id as string;
      await request(app)
        .post(`/api/habits/${habitId}/completions`)
        .send({ date: '2026-05-14' });
    });

    it('desmarca un día existente y responde 204', async () => {
      const res = await request(app)
        .delete(`/api/habits/${habitId}/completions?date=2026-05-14`);
      expect(res.status).toBe(204);

      const list = await request(app)
        .get(`/api/habits/${habitId}/completions?from=2026-05-01&to=2026-05-31`);
      expect(list.body).toEqual([]);
    });

    it('responde 400 si falta el query param date', async () => {
      const res = await request(app).delete(`/api/habits/${habitId}/completions`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/habits/:id/completions', () => {
    it('lista completions en el rango pedido', async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      const id = created.body.id as string;
      await request(app).post(`/api/habits/${id}/completions`).send({ date: '2026-05-10' });
      await request(app).post(`/api/habits/${id}/completions`).send({ date: '2026-05-15' });
      await request(app).post(`/api/habits/${id}/completions`).send({ date: '2026-06-01' });

      const res = await request(app)
        .get(`/api/habits/${id}/completions?from=2026-05-01&to=2026-05-31`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('responde 400 si falta from o to', async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      const id = created.body.id as string;
      const res = await request(app).get(`/api/habits/${id}/completions`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/habits/:id/stats', () => {
    it('devuelve streak, rate y range', async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      const id = created.body.id as string;
      await request(app).post(`/api/habits/${id}/completions`).send({ date: '2026-05-12' });
      await request(app).post(`/api/habits/${id}/completions`).send({ date: '2026-05-13' });
      await request(app).post(`/api/habits/${id}/completions`).send({ date: '2026-05-14' });

      const res = await request(app)
        .get(`/api/habits/${id}/stats?from=2026-05-01&to=2026-05-14&asOf=2026-05-14`);

      expect(res.status).toBe(200);
      expect(res.body.habitId).toBe(id);
      expect(res.body.streak).toBe(3);
      expect(res.body.rate.completed).toBe(3);
      expect(res.body.range).toEqual({ from: '2026-05-01', to: '2026-05-14' });
      expect(res.body.asOf).toBe('2026-05-14');
    });

    it('responde 404 si el hábito no existe', async () => {
      const res = await request(app)
        .get('/api/habits/no-existe/stats?from=2026-05-01&to=2026-05-14&asOf=2026-05-14');
      expect(res.status).toBe(404);
    });

    it('responde 400 si falta algún query param', async () => {
      const created = await request(app).post('/api/habits').send({ name: 'X' });
      const id = created.body.id as string;
      const res = await request(app).get(`/api/habits/${id}/stats?from=2026-05-01`);
      expect(res.status).toBe(400);
    });
  });
});
