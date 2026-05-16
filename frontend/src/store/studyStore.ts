import { create } from 'zustand';
import { studyClient } from '@/api/studyClient';
import type { StudyTopic } from '@/types/study';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface StudyStoreState {
  topics: StudyTopic[];
  status: LoadStatus;
  error: string | null;
}

interface StudyStoreActions {
  load: () => Promise<void>;
  createTopic: (title: string) => Promise<StudyTopic | null>;
  updateTopicTitle: (id: string, title: string) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  addItem: (topicId: string, label: string) => Promise<void>;
  updateItem: (topicId: string, itemId: string, label: string) => Promise<void>;
  toggleItem: (topicId: string, itemId: string) => Promise<void>;
  removeItem: (topicId: string, itemId: string) => Promise<void>;
  addLink: (topicId: string, label: string, url: string) => Promise<void>;
  updateLink: (
    topicId: string,
    linkId: string,
    changes: { label?: string; url?: string },
  ) => Promise<void>;
  removeLink: (topicId: string, linkId: string) => Promise<void>;
  reset: () => void;
}

export type StudyStore = StudyStoreState & StudyStoreActions;

const initialState: StudyStoreState = {
  topics: [],
  status: 'idle',
  error: null,
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Error desconocido';
}

export const useStudyStore = create<StudyStore>()((set, get) => {
  const replaceTopic = (updated: StudyTopic): void => {
    set((state) => ({
      topics: state.topics.map((t) => (t.id === updated.id ? updated : t)),
    }));
  };

  const wrap = async (fn: () => Promise<void>): Promise<void> => {
    try {
      await fn();
    } catch (err: unknown) {
      set({ error: errorMessage(err) });
      throw err;
    }
  };

  return {
    ...initialState,

    load: async () => {
      if (get().status === 'loading') return;
      set({ status: 'loading', error: null });
      try {
        const topics = await studyClient.list();
        set({ topics, status: 'ready' });
      } catch (err: unknown) {
        set({ status: 'error', error: errorMessage(err) });
      }
    },

    createTopic: async (title) => {
      try {
        const topic = await studyClient.createTopic(title);
        set((state) => ({ topics: [...state.topics, topic] }));
        return topic;
      } catch (err: unknown) {
        set({ error: errorMessage(err) });
        return null;
      }
    },

    updateTopicTitle: (id, title) =>
      wrap(async () => {
        const updated = await studyClient.updateTopicTitle(id, title);
        replaceTopic(updated);
      }),

    deleteTopic: (id) =>
      wrap(async () => {
        await studyClient.deleteTopic(id);
        set((state) => ({ topics: state.topics.filter((t) => t.id !== id) }));
      }),

    addItem: (topicId, label) =>
      wrap(async () => {
        const updated = await studyClient.addItem(topicId, label);
        replaceTopic(updated);
      }),

    updateItem: (topicId, itemId, label) =>
      wrap(async () => {
        const updated = await studyClient.updateItem(topicId, itemId, label);
        replaceTopic(updated);
      }),

    toggleItem: (topicId, itemId) =>
      wrap(async () => {
        const updated = await studyClient.toggleItem(topicId, itemId);
        replaceTopic(updated);
      }),

    removeItem: (topicId, itemId) =>
      wrap(async () => {
        const updated = await studyClient.removeItem(topicId, itemId);
        replaceTopic(updated);
      }),

    addLink: (topicId, label, url) =>
      wrap(async () => {
        const updated = await studyClient.addLink(topicId, label, url);
        replaceTopic(updated);
      }),

    updateLink: (topicId, linkId, changes) =>
      wrap(async () => {
        const updated = await studyClient.updateLink(topicId, linkId, changes);
        replaceTopic(updated);
      }),

    removeLink: (topicId, linkId) =>
      wrap(async () => {
        const updated = await studyClient.removeLink(topicId, linkId);
        replaceTopic(updated);
      }),

    reset: () => set(initialState),
  };
});
