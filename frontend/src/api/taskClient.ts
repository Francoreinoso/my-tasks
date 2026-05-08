import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';

const API_BASE_URL =
  (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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
      // body no es JSON, usamos el mensaje por defecto
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const taskClient = {
  list(): Promise<Task[]> {
    return request<Task[]>('/tasks');
  },
  create(input: CreateTaskInput): Promise<Task> {
    return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) });
  },
  update(id: string, input: UpdateTaskInput): Promise<Task> {
    return request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  toggle(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}/toggle`, { method: 'POST' });
  },
  remove(id: string): Promise<void> {
    return request<void>(`/tasks/${id}`, { method: 'DELETE' });
  },
};

export type TaskClient = typeof taskClient;
