import type { StudyTopic } from '@/domain/study/StudyTopic.js';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';

/**
 * Implementación in-memory para tests y uso sin persistencia.
 */
export class InMemoryStudyTopicRepository implements StudyTopicRepository {
  private readonly topics = new Map<string, StudyTopic>();

  findAll(): Promise<StudyTopic[]> {
    return Promise.resolve(Array.from(this.topics.values()));
  }

  findById(id: string): Promise<StudyTopic | null> {
    return Promise.resolve(this.topics.get(id) ?? null);
  }

  save(topic: StudyTopic): Promise<void> {
    this.topics.set(topic.id, topic);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.topics.delete(id);
    return Promise.resolve();
  }
}
