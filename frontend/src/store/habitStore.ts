import { create } from 'zustand';
import { habitClient } from '@/api/habitClient';
import { isoToday, lastNDays } from '@/lib/dateUtils';
import type {
  Habit,
  HabitCompletion,
  HabitStats,
  CreateHabitInput,
  UpdateHabitInput,
} from '@/types/habit';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

const TRACKING_LOOKBACK_DAYS = 30;

interface TrackingRange {
  from: string;
  to: string;
  asOf: string;
}

interface HabitStoreState {
  /** Hábitos activos + archivados, todos juntos. Los filtra el componente. */
  habits: Habit[];
  status: LoadStatus;
  error: string | null;
  /** Completions agrupadas por habitId (últimos N días). */
  completionsByHabit: Record<string, HabitCompletion[]>;
  /** Stats (racha + %) por habitId. */
  statsByHabit: Record<string, HabitStats>;
  /** Rango con el que se cargó tracking. Null antes del primer loadTracking. */
  trackingRange: TrackingRange | null;
}

interface HabitStoreActions {
  load: () => Promise<void>;
  create: (input: CreateHabitInput) => Promise<void>;
  update: (id: string, input: UpdateHabitInput) => Promise<void>;
  archive: (id: string) => Promise<void>;
  unarchive: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  loadTracking: (asOfIso?: string) => Promise<void>;
  markCompletion: (habitId: string, date: string) => Promise<void>;
  unmarkCompletion: (habitId: string, date: string) => Promise<void>;
  refreshStats: (habitId: string) => Promise<void>;
  reset: () => void;
}

export type HabitStore = HabitStoreState & HabitStoreActions;

const initialState: HabitStoreState = {
  habits: [],
  status: 'idle',
  error: null,
  completionsByHabit: {},
  statsByHabit: {},
  trackingRange: null,
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Error desconocido';
}

export const useHabitStore = create<HabitStore>()((set, get) => ({
  ...initialState,

  load: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading', error: null });
    try {
      // Cargamos activos + archivados para que la UI pueda filtrar localmente
      // sin idas y vueltas extras al servidor.
      const [active, archived] = await Promise.all([
        habitClient.list(false),
        habitClient.list(true),
      ]);
      set({ habits: [...active, ...archived], status: 'ready' });
    } catch (err: unknown) {
      set({ status: 'error', error: errorMessage(err) });
    }
  },

  create: async (input) => {
    try {
      const habit = await habitClient.create(input);
      set((state) => ({ habits: [...state.habits, habit] }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  update: async (id, input) => {
    try {
      const updated = await habitClient.update(id, input);
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? updated : h)),
      }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  archive: async (id) => {
    try {
      const updated = await habitClient.archive(id);
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? updated : h)),
      }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  unarchive: async (id) => {
    try {
      const updated = await habitClient.unarchive(id);
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? updated : h)),
      }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  remove: async (id) => {
    try {
      await habitClient.remove(id);
      set((state) => {
        const completionsByHabit = { ...state.completionsByHabit };
        const statsByHabit = { ...state.statsByHabit };
        delete completionsByHabit[id];
        delete statsByHabit[id];
        return {
          habits: state.habits.filter((h) => h.id !== id),
          completionsByHabit,
          statsByHabit,
        };
      });
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  loadTracking: async (asOfIso) => {
    const asOf = asOfIso ?? isoToday();
    const days = lastNDays(TRACKING_LOOKBACK_DAYS, asOf);
    const from = days[0];
    const to = days[days.length - 1];
    if (!from || !to) return;

    const activeHabits = get().habits.filter((h) => h.archivedAt === null);

    try {
      const results = await Promise.all(
        activeHabits.map(async (h) => {
          const [completions, stats] = await Promise.all([
            habitClient.listCompletions(h.id, from, to),
            habitClient.stats(h.id, from, to, asOf),
          ]);
          return { habitId: h.id, completions, stats };
        }),
      );

      const completionsByHabit: Record<string, HabitCompletion[]> = {};
      const statsByHabit: Record<string, HabitStats> = {};
      for (const r of results) {
        completionsByHabit[r.habitId] = r.completions;
        statsByHabit[r.habitId] = r.stats;
      }
      set({ completionsByHabit, statsByHabit, trackingRange: { from, to, asOf } });
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
    }
  },

  markCompletion: async (habitId, date) => {
    const current = get().completionsByHabit[habitId] ?? [];
    // Idempotencia local: si ya está marcado, no hacemos nada.
    if (current.some((c) => c.date === date)) return;

    const tempId = `temp-${crypto.randomUUID()}`;
    const tempCompletion: HabitCompletion = {
      id: tempId,
      habitId,
      date,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      completionsByHabit: {
        ...state.completionsByHabit,
        [habitId]: [...(state.completionsByHabit[habitId] ?? []), tempCompletion],
      },
    }));

    try {
      const real = await habitClient.markCompletion(habitId, date);
      set((state) => ({
        completionsByHabit: {
          ...state.completionsByHabit,
          [habitId]: (state.completionsByHabit[habitId] ?? []).map((c) =>
            c.id === tempId ? real : c,
          ),
        },
      }));
      await get().refreshStats(habitId);
    } catch (err: unknown) {
      // Rollback del optimistic update
      set((state) => ({
        completionsByHabit: {
          ...state.completionsByHabit,
          [habitId]: (state.completionsByHabit[habitId] ?? []).filter(
            (c) => c.id !== tempId,
          ),
        },
        error: errorMessage(err),
      }));
    }
  },

  unmarkCompletion: async (habitId, date) => {
    const current = get().completionsByHabit[habitId] ?? [];
    const target = current.find((c) => c.date === date);
    if (!target) return; // ya está desmarcado

    // Optimistic: lo quitamos
    set((state) => ({
      completionsByHabit: {
        ...state.completionsByHabit,
        [habitId]: (state.completionsByHabit[habitId] ?? []).filter(
          (c) => c.id !== target.id,
        ),
      },
    }));

    try {
      await habitClient.unmarkCompletion(habitId, date);
      await get().refreshStats(habitId);
    } catch (err: unknown) {
      // Rollback: lo volvemos a poner
      set((state) => ({
        completionsByHabit: {
          ...state.completionsByHabit,
          [habitId]: [...(state.completionsByHabit[habitId] ?? []), target],
        },
        error: errorMessage(err),
      }));
    }
  },

  refreshStats: async (habitId) => {
    const range = get().trackingRange;
    if (!range) return;
    try {
      const stats = await habitClient.stats(habitId, range.from, range.to, range.asOf);
      set((state) => ({
        statsByHabit: { ...state.statsByHabit, [habitId]: stats },
      }));
    } catch {
      // Fallo silencioso: stats queda obsoleto pero la UI no rompe.
    }
  },

  reset: () => set(initialState),
}));
