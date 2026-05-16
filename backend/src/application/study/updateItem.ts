import type { StudyTopic } from '@/domain/study/StudyTopic.js';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';
import { StudyTopicNotFoundError } from '@/domain/study/errors.js';

export async function updateItem(
  repo: StudyTopicRepository,
  topicId: string,
  itemId: string,
  changes: { label?: string },
): Promise<StudyTopic> {
  const existing = await repo.findById(topicId);
  if (!existing) throw new StudyTopicNotFoundError(topicId);

  const updated = existing.updateItem(itemId, changes);
  if (updated !== existing) await repo.save(updated);
  return updated;
}
