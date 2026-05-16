export class StudyTopicNotFoundError extends Error {
  readonly topicId: string;

  constructor(topicId: string) {
    super(`No existe ningún tema de estudio con id "${topicId}"`);
    this.name = 'StudyTopicNotFoundError';
    this.topicId = topicId;
  }
}

export class StudyTopicValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudyTopicValidationError';
  }
}

export class StudyItemNotFoundError extends Error {
  readonly itemId: string;

  constructor(itemId: string) {
    super(`No existe ningún subtema con id "${itemId}"`);
    this.name = 'StudyItemNotFoundError';
    this.itemId = itemId;
  }
}

export class StudyLinkNotFoundError extends Error {
  readonly linkId: string;

  constructor(linkId: string) {
    super(`No existe ningún link con id "${linkId}"`);
    this.name = 'StudyLinkNotFoundError';
    this.linkId = linkId;
  }
}
