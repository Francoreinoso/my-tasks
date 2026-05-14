export class HabitNotFoundError extends Error {
  readonly habitId: string;

  constructor(habitId: string) {
    super(`No existe ningún hábito con id "${habitId}"`);
    this.name = 'HabitNotFoundError';
    this.habitId = habitId;
  }
}

export class HabitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HabitValidationError';
  }
}

export class HabitArchivedError extends Error {
  readonly habitId: string;

  constructor(habitId: string) {
    super(`El hábito "${habitId}" está archivado y no acepta cambios de tracking`);
    this.name = 'HabitArchivedError';
    this.habitId = habitId;
  }
}

export class HabitCompletionNotFoundError extends Error {
  readonly completionId: string;

  constructor(completionId: string) {
    super(`No existe ningún registro de cumplimiento con id "${completionId}"`);
    this.name = 'HabitCompletionNotFoundError';
    this.completionId = completionId;
  }
}

export class HabitCompletionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HabitCompletionValidationError';
  }
}
