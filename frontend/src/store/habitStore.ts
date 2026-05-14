import { create } from 'zustand';
import { habitClient } from '@/api/habitClient';
import type { Habit, CreateHabitInput, UpdateHabitInput } from '@/types/habit';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface HabitStoreState {
  /** Hábitos activos + archivados, todos juntos. Los filtra el componente. */
  habits: Habit[];
  status: LoadStatus;
  error: string | null;
}

interface HabitStoreActions {
  load: () => Promise<void>;
  create: (input: CreateHabitInput) => Promise<void>;
  update: (id: string, input: UpdateHabitInput) => Promise<void>;
  archive: (id: string) => Promise<void>;
  unarchive: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export type HabitStore = HabitStoreState & HabitStoreActions;

const initialState: HabitStoreState = {
  habits: [],
  status: 'idle',
  error: null,
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
      set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  reset: () => set(initialState),
}));
