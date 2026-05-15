import { describe, it, expect } from 'vitest';
import { isApplicableOn } from './habitFrequency';
import type { HabitFrequency } from '@/types/habit';

describe('isApplicableOn', () => {
  it('daily aplica todos los días', () => {
    expect(isApplicableOn({ kind: 'daily' }, '2026-05-11')).toBe(true); // lun
    expect(isApplicableOn({ kind: 'daily' }, '2026-05-17')).toBe(true); // dom
  });

  it('weekdays aplica lunes a viernes únicamente', () => {
    expect(isApplicableOn({ kind: 'weekdays' }, '2026-05-11')).toBe(true);  // lun
    expect(isApplicableOn({ kind: 'weekdays' }, '2026-05-15')).toBe(true);  // vie
    expect(isApplicableOn({ kind: 'weekdays' }, '2026-05-16')).toBe(false); // sáb
    expect(isApplicableOn({ kind: 'weekdays' }, '2026-05-17')).toBe(false); // dom
  });

  it('custom aplica solo en los días configurados', () => {
    const f: HabitFrequency = { kind: 'custom', days: [1, 3, 5] };
    expect(isApplicableOn(f, '2026-05-11')).toBe(true);  // lun
    expect(isApplicableOn(f, '2026-05-12')).toBe(false); // mar
    expect(isApplicableOn(f, '2026-05-13')).toBe(true);  // mié
    expect(isApplicableOn(f, '2026-05-17')).toBe(false); // dom
  });
});
