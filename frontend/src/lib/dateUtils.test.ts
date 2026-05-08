import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  toIsoDate,
  fromIsoDate,
  getMondayOf,
  getCurrentWeekStart,
  getWeekDays,
  formatDDMMYYYY,
  parseDDMMYYYY,
  addWeeks,
  isoToday,
  getWeekDayName,
  formatWeekRange,
  isValidIsoDate,
} from './dateUtils';

afterEach(() => {
  vi.useRealTimers();
});

describe('toIsoDate / fromIsoDate (sin timezone drift)', () => {
  it('toIsoDate convierte un Date local a YYYY-MM-DD', () => {
    // 15 de mayo 2026, hora local
    const d = new Date(2026, 4, 15, 23, 30); // mayo es mes 4 (zero-indexed)
    expect(toIsoDate(d)).toBe('2026-05-15');
  });

  it('fromIsoDate parsea sin shifts de timezone', () => {
    const d = fromIsoDate('2026-05-15');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4); // mayo
    expect(d.getDate()).toBe(15);
  });

  it('roundtrip toIsoDate(fromIsoDate(x)) === x', () => {
    expect(toIsoDate(fromIsoDate('2026-05-15'))).toBe('2026-05-15');
    expect(toIsoDate(fromIsoDate('2026-01-01'))).toBe('2026-01-01');
    expect(toIsoDate(fromIsoDate('2026-12-31'))).toBe('2026-12-31');
  });
});

describe('getMondayOf', () => {
  it('si la fecha es lunes, devuelve el mismo lunes', () => {
    // 11 mayo 2026 = lunes
    const monday = fromIsoDate('2026-05-11');
    expect(toIsoDate(getMondayOf(monday))).toBe('2026-05-11');
  });

  it('si la fecha es martes, devuelve el lunes anterior', () => {
    const tuesday = fromIsoDate('2026-05-12');
    expect(toIsoDate(getMondayOf(tuesday))).toBe('2026-05-11');
  });

  it('si la fecha es domingo, devuelve el lunes 6 días antes', () => {
    const sunday = fromIsoDate('2026-05-17');
    expect(toIsoDate(getMondayOf(sunday))).toBe('2026-05-11');
  });
});

describe('getCurrentWeekStart', () => {
  it('devuelve el lunes de la semana actual basado en hoy', () => {
    vi.useFakeTimers();
    // miércoles 13 mayo 2026 a las 14:30 local
    vi.setSystemTime(new Date(2026, 4, 13, 14, 30));
    expect(getCurrentWeekStart()).toBe('2026-05-11');
  });
});

describe('getWeekDays', () => {
  it('devuelve 7 días consecutivos empezando por el lunes dado', () => {
    const days = getWeekDays('2026-05-11');
    expect(days).toEqual([
      '2026-05-11',
      '2026-05-12',
      '2026-05-13',
      '2026-05-14',
      '2026-05-15',
      '2026-05-16',
      '2026-05-17',
    ]);
  });

  it('cruza el cambio de mes correctamente', () => {
    const days = getWeekDays('2026-04-27'); // lunes 27 de abril
    expect(days).toEqual([
      '2026-04-27',
      '2026-04-28',
      '2026-04-29',
      '2026-04-30',
      '2026-05-01',
      '2026-05-02',
      '2026-05-03',
    ]);
  });
});

describe('formatDDMMYYYY / parseDDMMYYYY', () => {
  it('formatDDMMYYYY convierte ISO a DD-MM-YYYY', () => {
    expect(formatDDMMYYYY('2026-05-15')).toBe('15-05-2026');
    expect(formatDDMMYYYY('2026-01-09')).toBe('09-01-2026');
  });

  it('parseDDMMYYYY convierte DD-MM-YYYY a ISO', () => {
    expect(parseDDMMYYYY('15-05-2026')).toBe('2026-05-15');
    expect(parseDDMMYYYY('09-01-2026')).toBe('2026-01-09');
  });

  it('parseDDMMYYYY devuelve null si el formato es inválido', () => {
    expect(parseDDMMYYYY('2026-05-15')).toBeNull();
    expect(parseDDMMYYYY('mañana')).toBeNull();
    expect(parseDDMMYYYY('15/05/2026')).toBeNull();
    expect(parseDDMMYYYY('')).toBeNull();
  });

  it('parseDDMMYYYY rechaza fechas calendario inválidas', () => {
    expect(parseDDMMYYYY('30-02-2026')).toBeNull(); // 30 de febrero no existe
    expect(parseDDMMYYYY('32-01-2026')).toBeNull();
    expect(parseDDMMYYYY('15-13-2026')).toBeNull();
  });
});

describe('addWeeks', () => {
  it('suma N semanas', () => {
    expect(addWeeks('2026-05-11', 1)).toBe('2026-05-18');
    expect(addWeeks('2026-05-11', 2)).toBe('2026-05-25');
  });

  it('resta N semanas con valores negativos', () => {
    expect(addWeeks('2026-05-11', -1)).toBe('2026-05-04');
  });

  it('cruza años correctamente', () => {
    expect(addWeeks('2025-12-29', 1)).toBe('2026-01-05');
  });
});

describe('isoToday', () => {
  it('devuelve la fecha local de hoy en formato ISO', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 13, 23, 59)); // 13 mayo
    expect(isoToday()).toBe('2026-05-13');
  });
});

describe('getWeekDayName', () => {
  it('devuelve el nombre del día en español', () => {
    expect(getWeekDayName('2026-05-11')).toBe('Lunes');
    expect(getWeekDayName('2026-05-12')).toBe('Martes');
    expect(getWeekDayName('2026-05-17')).toBe('Domingo');
  });
});

describe('formatWeekRange', () => {
  it('devuelve "DD-MM-YYYY al DD-MM-YYYY"', () => {
    expect(formatWeekRange('2026-05-11')).toBe('11-05-2026 al 17-05-2026');
  });
});

describe('isValidIsoDate', () => {
  it('valida formato y fecha calendario', () => {
    expect(isValidIsoDate('2026-05-15')).toBe(true);
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('15-05-2026')).toBe(false);
    expect(isValidIsoDate('')).toBe(false);
  });
});
