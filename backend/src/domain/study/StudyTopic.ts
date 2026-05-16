import {
  StudyItemNotFoundError,
  StudyLinkNotFoundError,
  StudyTopicValidationError,
} from './errors.js';

export interface StudyItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface StudyLink {
  id: string;
  label: string;
  url: string;
}

export interface CreateStudyTopicInput {
  title: string;
}

export interface StudyTopicSnapshot {
  id: string;
  title: string;
  items: readonly StudyItem[];
  links: readonly StudyLink[];
  createdAt: Date;
  updatedAt: Date;
}

const MAX_TITLE_LENGTH = 200;
const MAX_ITEM_LABEL_LENGTH = 200;
const MAX_LINK_LABEL_LENGTH = 100;

function normalizeTitle(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new StudyTopicValidationError('El título no puede estar vacío');
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new StudyTopicValidationError(
      `El título no puede tener más de ${MAX_TITLE_LENGTH} caracteres`,
    );
  }
  return trimmed;
}

function normalizeItemLabel(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new StudyTopicValidationError('El label del subtema no puede estar vacío');
  }
  if (trimmed.length > MAX_ITEM_LABEL_LENGTH) {
    throw new StudyTopicValidationError(
      `El label del subtema no puede tener más de ${MAX_ITEM_LABEL_LENGTH} caracteres`,
    );
  }
  return trimmed;
}

function normalizeLinkLabel(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new StudyTopicValidationError('El label del link no puede estar vacío');
  }
  if (trimmed.length > MAX_LINK_LABEL_LENGTH) {
    throw new StudyTopicValidationError(
      `El label del link no puede tener más de ${MAX_LINK_LABEL_LENGTH} caracteres`,
    );
  }
  return trimmed;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new StudyTopicValidationError('La URL no puede estar vacía');
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new StudyTopicValidationError(`URL inválida: "${trimmed}"`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new StudyTopicValidationError(
      `Protocolo no permitido: ${parsed.protocol}. Solo se aceptan http y https.`,
    );
  }
  return trimmed;
}

export class StudyTopic {
  readonly id: string;
  readonly title: string;
  readonly items: readonly StudyItem[];
  readonly links: readonly StudyLink[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(snapshot: StudyTopicSnapshot) {
    this.id = snapshot.id;
    this.title = snapshot.title;
    this.items = snapshot.items;
    this.links = snapshot.links;
    this.createdAt = snapshot.createdAt;
    this.updatedAt = snapshot.updatedAt;
  }

  static create(input: CreateStudyTopicInput): StudyTopic {
    const title = normalizeTitle(input.title);
    const now = new Date();
    return new StudyTopic({
      id: crypto.randomUUID(),
      title,
      items: [],
      links: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(snapshot: StudyTopicSnapshot): StudyTopic {
    return new StudyTopic(snapshot);
  }

  toJSON(): StudyTopicSnapshot {
    return {
      id: this.id,
      title: this.title,
      items: this.items,
      links: this.links,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private withChanges(changes: Partial<StudyTopicSnapshot>): StudyTopic {
    return new StudyTopic({ ...this.toJSON(), ...changes, updatedAt: new Date() });
  }

  updateTitle(newTitle: string): StudyTopic {
    const normalized = normalizeTitle(newTitle);
    if (normalized === this.title) return this;
    return this.withChanges({ title: normalized });
  }

  // --- items ---

  addItem(label: string): StudyTopic {
    const normalized = normalizeItemLabel(label);
    const item: StudyItem = {
      id: crypto.randomUUID(),
      label: normalized,
      completed: false,
    };
    return this.withChanges({ items: [...this.items, item] });
  }

  updateItem(itemId: string, changes: { label?: string }): StudyTopic {
    const idx = this.items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new StudyItemNotFoundError(itemId);

    const existing = this.items[idx];
    if (!existing) throw new StudyItemNotFoundError(itemId);

    const nextLabel =
      changes.label !== undefined ? normalizeItemLabel(changes.label) : existing.label;
    if (nextLabel === existing.label) return this;

    const nextItems = [...this.items];
    nextItems[idx] = { ...existing, label: nextLabel };
    return this.withChanges({ items: nextItems });
  }

  toggleItem(itemId: string): StudyTopic {
    const idx = this.items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new StudyItemNotFoundError(itemId);

    const existing = this.items[idx];
    if (!existing) throw new StudyItemNotFoundError(itemId);

    const nextItems = [...this.items];
    nextItems[idx] = { ...existing, completed: !existing.completed };
    return this.withChanges({ items: nextItems });
  }

  removeItem(itemId: string): StudyTopic {
    const idx = this.items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new StudyItemNotFoundError(itemId);
    return this.withChanges({ items: this.items.filter((i) => i.id !== itemId) });
  }

  // --- links ---

  addLink(label: string, url: string): StudyTopic {
    const normalizedLabel = normalizeLinkLabel(label);
    const normalizedUrl = normalizeUrl(url);
    const link: StudyLink = {
      id: crypto.randomUUID(),
      label: normalizedLabel,
      url: normalizedUrl,
    };
    return this.withChanges({ links: [...this.links, link] });
  }

  updateLink(linkId: string, changes: { label?: string; url?: string }): StudyTopic {
    const idx = this.links.findIndex((l) => l.id === linkId);
    if (idx === -1) throw new StudyLinkNotFoundError(linkId);

    const existing = this.links[idx];
    if (!existing) throw new StudyLinkNotFoundError(linkId);

    const nextLabel =
      changes.label !== undefined ? normalizeLinkLabel(changes.label) : existing.label;
    const nextUrl =
      changes.url !== undefined ? normalizeUrl(changes.url) : existing.url;

    if (nextLabel === existing.label && nextUrl === existing.url) return this;

    const nextLinks = [...this.links];
    nextLinks[idx] = { ...existing, label: nextLabel, url: nextUrl };
    return this.withChanges({ links: nextLinks });
  }

  removeLink(linkId: string): StudyTopic {
    const idx = this.links.findIndex((l) => l.id === linkId);
    if (idx === -1) throw new StudyLinkNotFoundError(linkId);
    return this.withChanges({ links: this.links.filter((l) => l.id !== linkId) });
  }
}
