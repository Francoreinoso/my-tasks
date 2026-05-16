import type { StudyTopic } from '@/domain/study/StudyTopic.js';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';

/**
 * Lista todos los temas ordenados por createdAt ASC (más viejos primero).
 * Mantiene un orden estable para el usuario.
 */
export async function listTopics(repo: StudyTopicRepository): Promise<StudyTopic[]> {
  const all = await repo.findAll();
  return [...all].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
