import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHabitStore } from './habitStore';
import type { Habit, HabitCompletion, HabitStats } from '@/types/habit';

vi.mock('@/api/habitClient', () => ({
  habitClient: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
    remove: vi.fn(),
    listCompletions: vi.fn(),
    markCompletion: vi.fn(),
    unmarkCompletion: vi.fn(),
    stats: vi.fn(),
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

  describe('loadTracking', () => {
    function fakeCompletion(habitId: string, date: string): HabitCompletion {
      return {
        id: `c-${habitId}-${date}`,
        habitId,
        date,
        createdAt: new Date().toISOString(),
      };
    }

    function fakeStats(habitId: string, streak = 0): HabitStats {
      return {
        habitId,
        streak,
        rate: { applicable: 30, completed: streak, rate: streak / 30 },
        asOf: '2026-05-14',
        range: { from: '2026-04-15', to: '2026-05-14' },
      };
    }

    it('carga completions + stats por cada hábito activo', async () => {
      const a = fakeHabit({ id: 'a' });
      const b = fakeHabit({ id: 'b' });
      useHabitStore.setState({ habits: [a, b] });

      vi.mocked(habitClient.listCompletions).mockImplementation((habitId) =>
        Promise.resolve([fakeCompletion(habitId, '2026-05-14')]),
      );
      vi.mocked(habitClient.stats).mockImplementation((habitId) =>
        Promise.resolve(fakeStats(habitId, 3)),
      );

      await useHabitStore.getState().loadTracking('2026-05-14');

      const state = useHabitStore.getState();
      expect(state.completionsByHabit['a']).toHaveLength(1);
      expect(state.completionsByHabit['b']).toHaveLength(1);
      expect(state.statsByHabit['a']?.streak).toBe(3);
      expect(state.trackingRange?.asOf).toBe('2026-05-14');
    });

    it('omite hábitos archivados', async () => {
      const active = fakeHabit({ id: 'a' });
      const archived = fakeHabit({ id: 'b', archivedAt: new Date().toISOString() });
      useHabitStore.setState({ habits: [active, archived] });

      vi.mocked(habitClient.listCompletions).mockResolvedValue([]);
      vi.mocked(habitClient.stats).mockResolvedValue(fakeStats('a'));

      await useHabitStore.getState().loadTracking('2026-05-14');

      expect(useHabitStore.getState().completionsByHabit['b']).toBeUndefined();
      expect(vi.mocked(habitClient.listCompletions)).toHaveBeenCalledTimes(1);
    });
  });

  describe('markCompletion (optimistic)', () => {
    it('agrega la completion al instante y luego la reemplaza con la real', async () => {
      const h = fakeHabit({ id: 'h1' });
      useHabitStore.setState({
        habits: [h],
        trackingRange: { from: '2026-04-15', to: '2026-05-14', asOf: '2026-05-14' },
      });
      const real: HabitCompletion = {
        id: 'real-id',
        habitId: 'h1',
        date: '2026-05-14',
        createdAt: '2026-05-14T10:00:00.000Z',
      };
      vi.mocked(habitClient.markCompletion).mockResolvedValue(real);
      vi.mocked(habitClient.stats).mockResolvedValue({
        habitId: 'h1',
        streak: 1,
        rate: { applicable: 30, completed: 1, rate: 1 / 30 },
        asOf: '2026-05-14',
        range: { from: '2026-04-15', to: '2026-05-14' },
      });

      await useHabitStore.getState().markCompletion('h1', '2026-05-14');

      const state = useHabitStore.getState();
      expect(state.completionsByHabit['h1']).toHaveLength(1);
      expect(state.completionsByHabit['h1']?.[0]?.id).toBe('real-id');
      expect(state.statsByHabit['h1']?.streak).toBe(1);
    });

    it('si el server falla, hace rollback del optimistic update', async () => {
      const h = fakeHabit({ id: 'h1' });
      useHabitStore.setState({ habits: [h] });
      vi.mocked(habitClient.markCompletion).mockRejectedValue(new Error('boom'));

      await useHabitStore.getState().markCompletion('h1', '2026-05-14');

      expect(useHabitStore.getState().completionsByHabit['h1'] ?? []).toEqual([]);
      expect(useHabitStore.getState().error).toBe('boom');
    });

    it('es idempotente: si ya está marcado, no hace nada', async () => {
      const h = fakeHabit({ id: 'h1' });
      const existing: HabitCompletion = {
        id: 'existing',
        habitId: 'h1',
        date: '2026-05-14',
        createdAt: '',
      };
      useHabitStore.setState({
        habits: [h],
        completionsByHabit: { h1: [existing] },
      });

      await useHabitStore.getState().markCompletion('h1', '2026-05-14');

      expect(vi.mocked(habitClient.markCompletion)).not.toHaveBeenCalled();
      expect(useHabitStore.getState().completionsByHabit['h1']).toEqual([existing]);
    });
  });

  describe('unmarkCompletion (optimistic)', () => {
    it('quita la completion al instante y refresca stats al confirmar', async () => {
      const h = fakeHabit({ id: 'h1' });
      const existing: HabitCompletion = {
        id: 'existing',
        habitId: 'h1',
        date: '2026-05-14',
        createdAt: '',
      };
      useHabitStore.setState({
        habits: [h],
        completionsByHabit: { h1: [existing] },
        trackingRange: { from: '2026-04-15', to: '2026-05-14', asOf: '2026-05-14' },
      });
      vi.mocked(habitClient.unmarkCompletion).mockResolvedValue(undefined);
      vi.mocked(habitClient.stats).mockResolvedValue({
        habitId: 'h1',
        streak: 0,
        rate: { applicable: 30, completed: 0, rate: 0 },
        asOf: '2026-05-14',
        range: { from: '2026-04-15', to: '2026-05-14' },
      });

      await useHabitStore.getState().unmarkCompletion('h1', '2026-05-14');

      expect(useHabitStore.getState().completionsByHabit['h1']).toEqual([]);
      expect(useHabitStore.getState().statsByHabit['h1']?.streak).toBe(0);
    });

    it('si el server falla, restaura la completion', async () => {
      const h = fakeHabit({ id: 'h1' });
      const existing: HabitCompletion = {
        id: 'existing',
        habitId: 'h1',
        date: '2026-05-14',
        createdAt: '',
      };
      useHabitStore.setState({
        habits: [h],
        completionsByHabit: { h1: [existing] },
      });
      vi.mocked(habitClient.unmarkCompletion).mockRejectedValue(new Error('boom'));

      await useHabitStore.getState().unmarkCompletion('h1', '2026-05-14');

      expect(useHabitStore.getState().completionsByHabit['h1']).toEqual([existing]);
      expect(useHabitStore.getState().error).toBe('boom');
    });
  });
});
