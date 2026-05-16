export type LinkKind = 'youtube' | 'notebooklm' | 'github' | 'generic';

/**
 * Detecta el tipo de link a partir del hostname para decidir qué ícono mostrar.
 * Si la URL no parsea, devuelve 'generic' (no rompe).
 */
export function detectLinkKind(url: string): LinkKind {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return 'generic';
  }

  if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be') {
    return 'youtube';
  }
  if (host === 'notebooklm.google.com') {
    return 'notebooklm';
  }
  if (host === 'github.com' || host.endsWith('.github.com')) {
    return 'github';
  }
  return 'generic';
}
