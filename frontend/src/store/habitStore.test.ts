import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHabitStore } from './habitStore';
import type { Habit } from '@/types/habit';

vi.mock('@/api/habitClient', () => ({
  habitClient: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
    remove: vi.fn(),
  },
}));

const { habitClient } = await import('@/api/habitClient');

function fakeHabit(overrides: Partial<Habit> = {}): Habit {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? 'habit-1',
    name: 'Hábito de prueba',
    description: null,
    frequency: { kind: 'daily' },
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    ...overrides,
  };
}

describe('habitStore', () => {
  beforeEach(() => {
    useHabitStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('load', () => {
    it('combina activos + archivados y pasa a ready', async () => {
      const a = fakeHabit({ id: 'a' });
      const b = fakeHabit({ id: 'b', archivedAt: new Date().toISOString() });
      vi.mocked(habitClient.list).mockImplementation((archived) =>
        Promise.resolve(archived ? [b] : [a]),
      );

      await useHabitStore.getState().load();

      const state = useHabitStore.getState();
      expect(state.status).toBe('ready');
      expect(state.habits).toEqual([a, b]);
    });

    it('si falla, queda en status error', async () => {
      vi.mocked(habitClient.list).mockRejectedValue(new Error('Network down'));

      await useHabitStore.getState().load();

      const state = useHabitStore.getState();
      expect(state.status).toBe('error');
      expect(state.error).toBe('Network down');
    });
  });

  describe('create', () => {
    it('agrega el nuevo hábito al arreglo', async () => {
      const created = fakeHabit({ id: 'nuevo' });
      vi.mocked(habitClient.create).mockResolvedValue(created);

      await useHabitStore.getState().create({ name: 'X' });

      expect(useHabitStore.getState().habits).toContainEqual(created);
    });

    it('si el cliente falla, no muta la lista y propaga el error', async () => {
      vi.mocked(habitClient.create).mockRejectedValue(new Error('Validación'));

      await expect(
        useHabitStore.getState().create({ name: '' }),
      ).rejects.toThrow('Validación');

      expect(useHabitStore.getState().habits).toEqual([]);
      expect(useHabitStore.getState().error).toBe('Validación');
    });
  });

  describe('archive / unarchive', () => {
    it('archive reemplaza el hábito con su versión archivada', async () => {
      const original = fakeHabit({ id: 'x' });
      useHabitStore.setState({ habits: [original] });
      const archived = { ...original, archivedAt: new Date().toISOString() };
      vi.mocked(habitClient.archive).mockResolvedValue(archived);

      await useHabitStore.getState().archive('x');

      expect(useHabitStore.getState().habits[0]?.archivedAt).not.toBeNull();
    });

    it('unarchive vuelve archivedAt a null', async () => {
      const original = fakeHabit({ id: 'x', archivedAt: new Date().toISOString() });
      useHabitStore.setState({ habits: [original] });
      const restored = { ...original, archivedAt: null };
      vi.mocked(habitClient.unarchive).mockResolvedValue(restored);

      await useHabitStore.getState().unarchive('x');

      expect(useHabitStore.getState().habits[0]?.archivedAt).toBeNull();
    });
  });

  describe('remove', () => {
    it('elimina el hábito de la lista local', async () => {
      const a = fakeHabit({ id: 'a' });
      const b = fakeHabit({ id: 'b' });
      useHabitStore.setState({ habits: [a, b] });
      vi.mocked(habitClient.remove).mockResolvedValue(undefined);

      await useHabitStore.getState().remove('a');

      expect(useHabitStore.getState().habits).toEqual([b]);
    });
  });

  describe('update', () => {
    it('reemplaza el hábito con los nuevos datos', async () => {
      const original = fakeHabit({ id: 'a', name: 'viejo' });
      useHabitStore.setState({ habits: [original] });
      const updated = { ...original, name: 'nuevo' };
      vi.mocked(habitClient.update).mockResolvedValue(updated);

      await useHabitStore.getState().update('a', { name: 'nuevo' });

      expect(useHabitStore.getState().habits[0]?.name).toBe('nuevo');
    });
  });
});
