import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ClipboardText, CalendarCheck } from '@phosphor-icons/react';
import { SidebarItem } from './SidebarItem';
import type { NavItem } from '@/types/navigation';

function renderItem(item: NavItem, collapsed = false) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <SidebarItem item={item} collapsed={collapsed} />
    </MemoryRouter>,
  );
}

describe('SidebarItem', () => {
  const enabledItem: NavItem = {
    id: 'tasks',
    label: 'Tareas',
    icon: ClipboardText,
    path: '/',
    enabled: true,
  };

  const disabledItem: NavItem = {
    id: 'week',
    label: 'Semana',
    icon: CalendarCheck,
    path: '/semana',
    enabled: false,
  };

  it('renderiza un link cuando el ítem está habilitado', () => {
    renderItem(enabledItem);
    const link = screen.getByRole('link', { name: /tareas/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renderiza un div con aria-disabled cuando el ítem está deshabilitado', () => {
    renderItem(disabledItem);
    expect(screen.queryByRole('link', { name: /semana/i })).not.toBeInTheDocument();
    const item = screen.getByText(/semana/i);
    expect(item.closest('[aria-disabled="true"]')).not.toBeNull();
  });

  it('cuando colapsado oculta el label pero deja el ícono SVG', () => {
    renderItem(enabledItem, true);
    const link = screen.getByRole('link');
    expect(link.querySelector('svg')).not.toBeNull();
    expect(screen.queryByText('Tareas')).not.toBeInTheDocument();
  });

  it('muestra "(pronto)" en items deshabilitados cuando está expandido', () => {
    renderItem(disabledItem, false);
    expect(screen.getByText(/pronto/i)).toBeInTheDocument();
  });
});
