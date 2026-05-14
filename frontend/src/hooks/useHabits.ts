import { useEffect } from 'react';
import { useHabitStore, type HabitStore } from '@/store/habitStore';

/**
 * Hook ergonómico que expone el store y dispara la carga inicial una sola vez.
 * Cualquier componente que necesite hábitos debe usar este hook (no useHabitStore directo)
 * para asegurar que los datos estén cargados.
 */
export function useHabits(): HabitStore {
  const store = useHabitStore();

  useEffect(() => {
    if (store.status === 'idle') {
      void store.load();
    }
    // intencional: queremos que se chequee status al montar; load tiene su propio guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
