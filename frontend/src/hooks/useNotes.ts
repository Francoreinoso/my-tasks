import { useEffect } from 'react';
import { useNoteStore, type NoteStore } from '@/store/noteStore';

/**
 * Hook ergonómico que expone el store de notas y dispara la carga inicial una vez.
 */
export function useNotes(): NoteStore {
  const store = useNoteStore();

  useEffect(() => {
    if (store.status === 'idle') {
      void store.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
