import type { StudyTopic } from '@/domain/study/StudyTopic.js';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';
import { StudyTopicNotFoundError } from '@/domain/study/errors.js';

export async function updateLink(
  repo: StudyTopicRepository,
  topicId: string,
  linkId: string,
  changes: { label?: string; url?: string },
): Promise<StudyTopic> {
  const existing = await repo.findById(topicId);
  if (!existing) throw new StudyTopicNotFoundError(topicId);

  const updated = existing.updateLink(linkId, changes);
  if (updated !== existing) await repo.save(updated);
  return updated;
}
