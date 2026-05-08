export class TaskNotFoundError extends Error {
  readonly taskId: string;

  constructor(taskId: string) {
    super(`No existe ninguna tarea con id "${taskId}"`);
    this.name = 'TaskNotFoundError';
    this.taskId = taskId;
  }
}

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}
