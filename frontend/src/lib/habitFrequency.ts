import type { HabitFrequency, Weekday } from '@/types/habit';
import { getWeekday } from './dateUtils';

/**
 * ¿Aplica este hábito en la fecha indicada según su frecuencia?
 *
 * NOTA: lógica espejo de `Habit.isApplicableOn` del backend. La replicamos
 * porque la UI necesita decidir el estilo de cada celda (aplicable vs no
 * aplicable) sin pegarle al server. Si las reglas evolucionan, hay que
 * actualizar ambos lugares. Cubierto por tests propios para detectar drift.
 */
export function isApplicableOn(frequency: HabitFrequency, isoDate: string): boolean {
  const weekday = getWeekday(isoDate) as Weekday;
  switch (frequency.kind) {
    case 'daily':
      return true;
    case 'weekdays':
      return weekday >= 1 && weekday <= 5;
    case 'custom':
      return frequency.days.includes(weekday);
  }
}
