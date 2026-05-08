export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  enabled: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'tasks', label: 'Tareas', icon: '📋', path: '/', enabled: true },
  { id: 'week', label: 'Semana', icon: '📅', path: '/semana', enabled: true },
  { id: 'study', label: 'Estudio', icon: '📚', path: '/estudio', enabled: false },
  { id: 'notes', label: 'Notas', icon: '📝', path: '/notas', enabled: false },
] as const;
