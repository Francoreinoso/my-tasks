import { useEffect } from 'react';
import { useStudyStore, type StudyStore } from '@/store/studyStore';

export function useStudy(): StudyStore {
  const store = useStudyStore();

  useEffect(() => {
    if (store.status === 'idle') {
      void store.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
