import {
  StudyTopic,
  type CreateStudyTopicInput,
} from '@/domain/study/StudyTopic.js';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';

export async function createTopic(
  repo: StudyTopicRepository,
  input: CreateStudyTopicInput,
): Promise<StudyTopic> {
  const topic = StudyTopic.create(input);
  await repo.save(topic);
  return topic;
}
