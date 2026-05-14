export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HabitFrequency =
  | { kind: 'daily' }
  | { kind: 'weekdays' }
  | { kind: 'custom'; days: Weekday[] };

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface CreateHabitInput {
  name: string;
  description?: string | null;
  frequency?: HabitFrequency;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  frequency?: HabitFrequency;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  createdAt: string;
}

export interface HabitStats {
  habitId: string;
  streak: number;
  rate: {
    applicable: number;
    completed: number;
    rate: number;
  };
  asOf: string;
  range: { from: string; to: string };
}
