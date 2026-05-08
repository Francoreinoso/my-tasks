import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { Sidebar } from './Sidebar';

function renderSidebar(props: { collapsed?: boolean; onToggle?: () => void } = {}) {
  const onToggle = props.onToggle ?? vi.fn();
  const utils = render(
    <MemoryRouter>
      <Sidebar collapsed={props.collapsed ?? false} onToggle={onToggle} />
    </MemoryRouter>,
  );
  return { ...utils, onToggle };
}

describe('Sidebar', () => {
  it('muestra el título "my-tasks" cuando está expandido', () => {
    renderSidebar();
    expect(screen.getByRole('heading', { name: /my-tasks/i })).toBeInTheDocument();
  });

  it('oculta el título cuando está colapsado', () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByRole('heading', { name: /my-tasks/i })).not.toBeInTheDocument();
  });

  it('renderiza todos los items de navegación', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: /tareas/i })).toBeInTheDocument();
    expect(screen.getByText(/semana/i)).toBeInTheDocument();
    expect(screen.getByText(/estudio/i)).toBeInTheDocument();
    expect(screen.getByText(/notas/i)).toBeInTheDocument();
  });

  it('llama a onToggle cuando se clickea el botón de colapsar', async () => {
    const user = userEvent.setup();
    const { onToggle } = renderSidebar();
    await user.click(screen.getByRole('button', { name: /colapsar menú/i }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('actualiza aria-label del botón según el estado', () => {
    const { rerender, onToggle } = renderSidebar({ collapsed: false });
    expect(screen.getByRole('button', { name: /colapsar/i })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <Sidebar collapsed={true} onToggle={onToggle} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /expandir/i })).toBeInTheDocument();
  });
});
