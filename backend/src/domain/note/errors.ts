export class NoteNotFoundError extends Error {
  readonly noteId: string;

  constructor(noteId: string) {
    super(`No existe ninguna nota con id "${noteId}"`);
    this.name = 'NoteNotFoundError';
    this.noteId = noteId;
  }
}

export class NoteValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoteValidationError';
  }
}
