import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from './taskStore';
import type { Task } from '@/types/task';

vi.mock('@/api/taskClient', () => ({
  taskClient: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
  },
}));

const { taskClient } = await import('@/api/taskClient');

function fakeTask(overrides: Partial<Task> = {}): Task {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? 'task-1',
    title: 'Tarea de prueba',
    description: null,
    dueDate: null,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('taskStore', () => {
  beforeEach(() => {
    useTaskStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('load', () => {
    it('pasa de idle a ready y guarda las tareas devueltas por el cliente', async () => {
      const tasks = [fakeTask({ id: 'a' }), fakeTask({ id: 'b' })];
      vi.mocked(taskClient.list).mockResolvedValue(tasks);

      await useTaskStore.getState().load();

      const state = useTaskStore.getState();
      expect(state.status).toBe('ready');
      expect(state.tasks).toEqual(tasks);
      expect(state.error).toBeNull();
    });

    it('si falla, queda en status error con el mensaje', async () => {
      vi.mocked(taskClient.list).mockRejectedValue(new Error('Network down'));

      await useTaskStore.getState().load();

      const state = useTaskStore.getState();
      expect(state.status).toBe('error');
      expect(state.error).toBe('Network down');
    });
  });

  describe('create', () => {
    it('agrega la nueva tarea al final del arreglo', async () => {
      const created = fakeTask({ id: 'nueva' });
      vi.mocked(taskClient.create).mockResolvedValue(created);

      await useTaskStore.getState().create({ title: 'Nueva' });

      expect(useTaskStore.getState().tasks).toContainEqual(created);
    });

    it('si el cliente falla, la lista no cambia y se setea el error', async () => {
      vi.mocked(taskClient.create).mockRejectedValue(new Error('Validación'));

      await expect(
        useTaskStore.getState().create({ title: '' }),
      ).rejects.toThrow('Validación');

      expect(useTaskStore.getState().tasks).toEqual([]);
      expect(useTaskStore.getState().error).toBe('Validación');
    });
  });

  describe('toggle', () => {
    it('reemplaza la tarea con la versión actualizada', async () => {
      const original = fakeTask({ id: 'x', status: 'pending' });
      useTaskStore.setState({ tasks: [original] });
      const toggled = { ...original, status: 'completed' as const };
      vi.mocked(taskClient.toggle).mockResolvedValue(toggled);

      await useTaskStore.getState().toggle('x');

      expect(useTaskStore.getState().tasks[0]?.status).toBe('completed');
    });
  });

  describe('remove', () => {
    it('elimina la tarea de la lista local', async () => {
      const a = fakeTask({ id: 'a' });
      const b = fakeTask({ id: 'b' });
      useTaskStore.setState({ tasks: [a, b] });
      vi.mocked(taskClient.remove).mockResolvedValue(undefined);

      await useTaskStore.getState().remove('a');

      expect(useTaskStore.getState().tasks).toEqual([b]);
    });
  });

  describe('update', () => {
    it('reemplaza la tarea con los nuevos datos', async () => {
      const original = fakeTask({ id: 'a', title: 'viejo' });
      useTaskStore.setState({ tasks: [original] });
      const updated = { ...original, title: 'nuevo' };
      vi.mocked(taskClient.update).mockResolvedValue(updated);

      await useTaskStore.getState().update('a', { title: 'nuevo' });

      expect(useTaskStore.getState().tasks[0]?.title).toBe('nuevo');
    });
  });
});
