import type { StudyTopic } from '@/domain/study/StudyTopic.js';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';
import { StudyTopicNotFoundError } from '@/domain/study/errors.js';

export async function updateTopicTitle(
  repo: StudyTopicRepository,
  id: string,
  newTitle: string,
): Promise<StudyTopic> {
  const existing = await repo.findById(id);
  if (!existing) throw new StudyTopicNotFoundError(id);

  const updated = existing.updateTitle(newTitle);
  if (updated !== existing) await repo.save(updated);
  return updated;
}
