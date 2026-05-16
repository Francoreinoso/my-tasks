import type { StudyTopic } from '@/domain/study/StudyTopic.js';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';
import { StudyTopicNotFoundError } from '@/domain/study/errors.js';

export async function addItem(
  repo: StudyTopicRepository,
  topicId: string,
  label: string,
): Promise<StudyTopic> {
  const existing = await repo.findById(topicId);
  if (!existing) throw new StudyTopicNotFoundError(topicId);

  const updated = existing.addItem(label);
  await repo.save(updated);
  return updated;
}
