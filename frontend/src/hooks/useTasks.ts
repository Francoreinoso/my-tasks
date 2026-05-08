import { useEffect } from 'react';
import { useTaskStore, type TaskStore } from '@/store/taskStore';

/**
 * Hook ergonómico que expone el store y dispara la carga inicial una sola vez.
 * Cualquier componente que necesite tareas debe usar este hook (no useTaskStore directo)
 * para asegurar que los datos estén cargados.
 */
export function useTasks(): TaskStore {
  const store = useTaskStore();

  useEffect(() => {
    if (store.status === 'idle') {
      void store.load();
    }
    // intencional: queremos que se chequee status al montar; load tiene su propio guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
