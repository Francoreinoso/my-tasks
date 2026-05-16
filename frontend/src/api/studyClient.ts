import type { StudyTopic } from '@/types/study';
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
      // body no es JSON
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const studyClient = {
  list(): Promise<StudyTopic[]> {
    return request<StudyTopic[]>('/study/topics');
  },
  createTopic(title: string): Promise<StudyTopic> {
    return request<StudyTopic>('/study/topics', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },
  updateTopicTitle(id: string, title: string): Promise<StudyTopic> {
    return request<StudyTopic>(`/study/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },
  deleteTopic(id: string): Promise<void> {
    return request<void>(`/study/topics/${id}`, { method: 'DELETE' });
  },
  addItem(topicId: string, label: string): Promise<StudyTopic> {
    return request<StudyTopic>(`/study/topics/${topicId}/items`, {
      method: 'POST',
      body: JSON.stringify({ label }),
    });
  },
  updateItem(topicId: string, itemId: string, label: string): Promise<StudyTopic> {
    return request<StudyTopic>(`/study/topics/${topicId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ label }),
    });
  },
  toggleItem(topicId: string, itemId: string): Promise<StudyTopic> {
    return request<StudyTopic>(`/study/topics/${topicId}/items/${itemId}/toggle`, {
      method: 'POST',
    });
  },
  removeItem(topicId: string, itemId: string): Promise<StudyTopic> {
    return request<StudyTopic>(`/study/topics/${topicId}/items/${itemId}`, {
      method: 'DELETE',
    });
  },
  addLink(topicId: string, label: string, url: string): Promise<StudyTopic> {
    return request<StudyTopic>(`/study/topics/${topicId}/links`, {
      method: 'POST',
      body: JSON.stringify({ label, url }),
    });
  },
  updateLink(
    topicId: string,
    linkId: string,
    changes: { label?: string; url?: string },
  ): Promise<StudyTopic> {
    return request<StudyTopic>(`/study/topics/${topicId}/links/${linkId}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  },
  removeLink(topicId: string, linkId: string): Promise<StudyTopic> {
    return request<StudyTopic>(`/study/topics/${topicId}/links/${linkId}`, {
      method: 'DELETE',
    });
  },
};

export type StudyClient = typeof studyClient;
