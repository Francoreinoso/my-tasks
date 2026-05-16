import { describe, it, expect } from 'vitest';
import { detectLinkKind } from './linkType';

describe('detectLinkKind', () => {
  it('reconoce youtube.com', () => {
    expect(detectLinkKind('https://www.youtube.com/watch?v=abc')).toBe('youtube');
    expect(detectLinkKind('https://youtube.com/c/canal')).toBe('youtube');
  });

  it('reconoce youtu.be', () => {
    expect(detectLinkKind('https://youtu.be/abc')).toBe('youtube');
  });

  it('reconoce notebooklm.google.com', () => {
    expect(detectLinkKind('https://notebooklm.google.com/notebook/xyz')).toBe(
      'notebooklm',
    );
  });

  it('reconoce github.com', () => {
    expect(detectLinkKind('https://github.com/foo/bar')).toBe('github');
  });

  it('cualquier otro host devuelve generic', () => {
    expect(detectLinkKind('https://example.com/x')).toBe('generic');
    expect(detectLinkKind('https://platzi.com/curso')).toBe('generic');
  });

  it('URL inválida devuelve generic sin romper', () => {
    expect(detectLinkKind('no-es-url')).toBe('generic');
    expect(detectLinkKind('')).toBe('generic');
  });
});
