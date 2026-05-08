import type { Task } from './Task.js';

/**
 * Contrato del repositorio de tareas. La capa de dominio solo conoce esta
 * interfaz: NO sabe si los datos viven en memoria, en JSON, en SQLite o en
 * Postgres. Esa decisión es de infraestructura.
 */
export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
