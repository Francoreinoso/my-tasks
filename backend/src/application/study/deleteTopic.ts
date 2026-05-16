import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';
import { StudyTopicNotFoundError } from '@/domain/study/errors.js';

export async function deleteTopic(
  repo: StudyTopicRepository,
  id: string,
): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new StudyTopicNotFoundError(id);
  await repo.delete(id);
}
