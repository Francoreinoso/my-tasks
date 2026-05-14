import type {
  Habit,
  HabitCompletion,
  HabitStats,
  CreateHabitInput,
  UpdateHabitInput,
} from '@/types/habit';
import { ApiError } from '@/api/taskClient';

const API_BASE_URL =
  (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:4000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${String(res.status)}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      // body no es JSON, mantener mensaje genérico
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const habitClient = {
  list(archived = false): Promise<Habit[]> {
    return request<Habit[]>(`/habits${archived ? '?archived=true' : ''}`);
  },
  create(input: CreateHabitInput): Promise<Habit> {
    return request<Habit>('/habits', { method: 'POST', body: JSON.stringify(input) });
  },
  get(id: string): Promise<Habit> {
    return request<Habit>(`/habits/${id}`);
  },
  update(id: string, input: UpdateHabitInput): Promise<Habit> {
    return request<Habit>(`/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  archive(id: string): Promise<Habit> {
    return request<Habit>(`/habits/${id}/archive`, { method: 'POST' });
  },
  unarchive(id: string): Promise<Habit> {
    return request<Habit>(`/habits/${id}/unarchive`, { method: 'POST' });
  },
  remove(id: string): Promise<void> {
    return request<void>(`/habits/${id}`, { method: 'DELETE' });
  },
  listCompletions(habitId: string, from: string, to: string): Promise<HabitCompletion[]> {
    return request<HabitCompletion[]>(
      `/habits/${habitId}/completions?from=${from}&to=${to}`,
    );
  },
  markCompletion(habitId: string, date: string): Promise<HabitCompletion> {
    return request<HabitCompletion>(`/habits/${habitId}/completions`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },
  unmarkCompletion(habitId: string, date: string): Promise<void> {
    return request<void>(`/habits/${habitId}/completions?date=${date}`, {
      method: 'DELETE',
    });
  },
  stats(
    habitId: string,
    from: string,
    to: string,
    asOf: string,
  ): Promise<HabitStats> {
    return request<HabitStats>(
      `/habits/${habitId}/stats?from=${from}&to=${to}&asOf=${asOf}`,
    );
  },
};

export type HabitClient = typeof habitClient;
