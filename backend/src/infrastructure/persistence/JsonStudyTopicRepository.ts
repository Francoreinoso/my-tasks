import fs from 'node:fs/promises';
import path from 'node:path';
import { StudyTopic } from '@/domain/study/StudyTopic.js';
import type {
  StudyItem,
  StudyLink,
} from '@/domain/study/StudyTopic.js';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';

interface PersistedStudyTopic {
  id: string;
  title: string;
  items: StudyItem[];
  links: StudyLink[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Persistencia JSON con escritura atómica (write-then-rename).
 */
export class JsonStudyTopicRepository implements StudyTopicRepository {
  private constructor(
    private readonly filePath: string,
    private readonly topics: Map<string, StudyTopic>,
  ) {}

  static async load(filePath: string): Promise<JsonStudyTopicRepository> {
    const topics = new Map<string, StudyTopic>();

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw) as PersistedStudyTopic[];
      for (const item of data) {
        const topic = StudyTopic.fromPersistence({
          id: item.id,
          title: item.title,
          items: item.items,
          links: item.links,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        });
        topics.set(topic.id, topic);
      }
    } catch (err: unknown) {
      if (!isFileNotFound(err)) throw err;
    }

    return new JsonStudyTopicRepository(filePath, topics);
  }

  findAll(): Promise<StudyTopic[]> {
    return Promise.resolve(Array.from(this.topics.values()));
  }

  findById(id: string): Promise<StudyTopic | null> {
    return Promise.resolve(this.topics.get(id) ?? null);
  }

  async save(topic: StudyTopic): Promise<void> {
    this.topics.set(topic.id, topic);
    await this.flush();
  }

  async delete(id: string): Promise<void> {
    this.topics.delete(id);
    await this.flush();
  }

  private async flush(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    const serializable: PersistedStudyTopic[] = Array.from(this.topics.values()).map(
      (topic) => {
        const snap = topic.toJSON();
        return {
          id: snap.id,
          title: snap.title,
          items: [...snap.items],
          links: [...snap.links],
          createdAt: snap.createdAt.toISOString(),
          updatedAt: snap.updatedAt.toISOString(),
        };
      },
    );

    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(serializable, null, 2), 'utf-8');
    await fs.rename(tmpPath, this.filePath);
  }
}

function isFileNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 'ENOENT'
  );
}
