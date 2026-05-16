import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note';
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

export const noteClient = {
  list(): Promise<Note[]> {
    return request<Note[]>('/notes');
  },
  create(input: CreateNoteInput): Promise<Note> {
    return request<Note>('/notes', { method: 'POST', body: JSON.stringify(input) });
  },
  get(id: string): Promise<Note> {
    return request<Note>(`/notes/${id}`);
  },
  update(id: string, input: UpdateNoteInput): Promise<Note> {
    return request<Note>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  remove(id: string): Promise<void> {
    return request<void>(`/notes/${id}`, { method: 'DELETE' });
  },
};

export type NoteClient = typeof noteClient;
