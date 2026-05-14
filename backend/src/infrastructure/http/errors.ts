/**
 * Errores específicos de la capa HTTP (no del dominio).
 * Para validación de query params, parámetros de URL, etc.
 */
export class QueryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryValidationError';
  }
}
