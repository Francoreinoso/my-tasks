import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeekHeader } from './WeekHeader';

describe('WeekHeader', () => {
  const baseProps = {
    weekStart: '2026-05-11',
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
    isCurrentWeek: false,
  };

  it('muestra el rango de la semana en formato DD-MM-YYYY', () => {
    render(<WeekHeader {...baseProps} />);
    expect(screen.getByLabelText(/rango de fechas/i)).toHaveTextContent(
      '11-05-2026 al 17-05-2026',
    );
  });

  it('llama a onPrevious y onNext al clickear las flechas', async () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    const user = userEvent.setup();
    render(<WeekHeader {...baseProps} onPrevious={onPrevious} onNext={onNext} />);

    await user.click(screen.getByRole('button', { name: /semana anterior/i }));
    await user.click(screen.getByRole('button', { name: /semana siguiente/i }));

    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('deshabilita el botón "Hoy" cuando estamos en la semana actual', () => {
    render(<WeekHeader {...baseProps} isCurrentWeek={true} />);
    expect(screen.getByRole('button', { name: /semana actual/i })).toBeDisabled();
  });

  it('habilita el botón "Hoy" cuando NO estamos en la semana actual', async () => {
    const onToday = vi.fn();
    const user = userEvent.setup();
    render(<WeekHeader {...baseProps} isCurrentWeek={false} onToday={onToday} />);

    const todayBtn = screen.getByRole('button', { name: /semana actual/i });
    expect(todayBtn).not.toBeDisabled();
    await user.click(todayBtn);
    expect(onToday).toHaveBeenCalledOnce();
  });
});
