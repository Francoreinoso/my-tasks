import type { StudyTopic } from '@/domain/study/StudyTopic.js';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';
import { StudyTopicNotFoundError } from '@/domain/study/errors.js';

export async function getTopic(
  repo: StudyTopicRepository,
  id: string,
): Promise<StudyTopic> {
  const topic = await repo.findById(id);
  if (!topic) throw new StudyTopicNotFoundError(id);
  return topic;
}
