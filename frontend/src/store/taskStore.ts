import { create } from 'zustand';
import { taskClient } from '@/api/taskClient';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface TaskStoreState {
  tasks: Task[];
  status: LoadStatus;
  error: string | null;
}

interface TaskStoreActions {
  load: () => Promise<void>;
  create: (input: CreateTaskInput) => Promise<void>;
  update: (id: string, input: UpdateTaskInput) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export type TaskStore = TaskStoreState & TaskStoreActions;

const initialState: TaskStoreState = {
  tasks: [],
  status: 'idle',
  error: null,
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Error desconocido';
}

export const useTaskStore = create<TaskStore>()((set, get) => ({
  ...initialState,

  load: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading', error: null });
    try {
      const tasks = await taskClient.list();
      set({ tasks, status: 'ready' });
    } catch (err: unknown) {
      set({ status: 'error', error: errorMessage(err) });
    }
  },

  create: async (input) => {
    try {
      const task = await taskClient.create(input);
      set((state) => ({ tasks: [...state.tasks, task] }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  update: async (id, input) => {
    try {
      const updated = await taskClient.update(id, input);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  toggle: async (id) => {
    try {
      const updated = await taskClient.toggle(id);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  remove: async (id) => {
    try {
      await taskClient.remove(id);
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  reset: () => set(initialState),
}));
