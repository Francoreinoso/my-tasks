import { create } from 'zustand';
import { noteClient } from '@/api/noteClient';
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface NoteStoreState {
  notes: Note[];
  status: LoadStatus;
  error: string | null;
}

interface NoteStoreActions {
  load: () => Promise<void>;
  create: (input: CreateNoteInput) => Promise<Note>;
  update: (id: string, input: UpdateNoteInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export type NoteStore = NoteStoreState & NoteStoreActions;

const initialState: NoteStoreState = {
  notes: [],
  status: 'idle',
  error: null,
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Error desconocido';
}

function sortByUpdatedDesc(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export const useNoteStore = create<NoteStore>()((set, get) => ({
  ...initialState,

  load: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading', error: null });
    try {
      const notes = await noteClient.list();
      set({ notes, status: 'ready' });
    } catch (err: unknown) {
      set({ status: 'error', error: errorMessage(err) });
    }
  },

  create: async (input) => {
    try {
      const note = await noteClient.create(input);
      set((state) => ({ notes: sortByUpdatedDesc([note, ...state.notes]) }));
      return note;
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  update: async (id, input) => {
    try {
      const updated = await noteClient.update(id, input);
      set((state) => ({
        notes: sortByUpdatedDesc(
          state.notes.map((n) => (n.id === id ? updated : n)),
        ),
      }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  remove: async (id) => {
    try {
      await noteClient.remove(id);
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  reset: () => set(initialState),
}));
