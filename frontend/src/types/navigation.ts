import {
  BookBookmark,
  CalendarCheck,
  ClipboardText,
  NotePencil,
  Repeat,
  type Icon,
} from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  label: string;
  icon: Icon;
  path: string;
  enabled: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'tasks', label: 'Tareas', icon: ClipboardText, path: '/', enabled: true },
  { id: 'week', label: 'Semana', icon: CalendarCheck, path: '/semana', enabled: true },
  { id: 'rutina', label: 'Rutina', icon: Repeat, path: '/rutina', enabled: true },
  { id: 'study', label: 'Estudio', icon: BookBookmark, path: '/estudio', enabled: false },
  { id: 'notes', label: 'Notas', icon: NotePencil, path: '/notas', enabled: false },
] as const;
