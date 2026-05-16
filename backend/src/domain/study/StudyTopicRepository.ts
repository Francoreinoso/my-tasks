import type { StudyTopic } from './StudyTopic.js';

/**
 * Contrato del repositorio de temas de estudio.
 * StudyTopic es un agregado: items y links viven dentro del topic.
 */
export interface StudyTopicRepository {
  findAll(): Promise<StudyTopic[]>;
  findById(id: string): Promise<StudyTopic | null>;
  save(topic: StudyTopic): Promise<void>;
  delete(id: string): Promise<void>;
}
