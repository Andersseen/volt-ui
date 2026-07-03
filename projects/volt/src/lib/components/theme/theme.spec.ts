import { describe, it, expect, afterEach } from 'vitest';
import { applyVoltTheme } from './theme';

function createTestDocument(): Document {
  return document.implementation.createHTMLDocument('test');
}

describe('applyVoltTheme', () => {
  it('sets the data-color attribute', () => {
    const doc = createTestDocument();

    applyVoltTheme({ color: 'ember' }, doc);

    expect(doc.documentElement.getAttribute('data-color')).toBe('ember');
  });

  it('sets the data-style attribute', () => {
    const doc = createTestDocument();

    applyVoltTheme({ style: 'brutal' }, doc);

    expect(doc.documentElement.getAttribute('data-style')).toBe('brutal');
  });

  it('adds the dark class and sets color-scheme to dark', () => {
    const doc = createTestDocument();

    applyVoltTheme({ dark: true }, doc);

    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    expect(doc.documentElement.style.colorScheme).toBe('dark');
  });

  it('removes the dark class and sets color-scheme to light', () => {
    const doc = createTestDocument();
    doc.documentElement.classList.add('dark');

    applyVoltTheme({ dark: false }, doc);

    expect(doc.documentElement.classList.contains('dark')).toBe(false);
    expect(doc.documentElement.style.colorScheme).toBe('light');
  });

  it('leaves unrelated attributes untouched when an option is omitted', () => {
    const doc = createTestDocument();
    doc.documentElement.setAttribute('data-color', 'sage');

    applyVoltTheme({ style: 'ghost' }, doc);

    expect(doc.documentElement.getAttribute('data-color')).toBe('sage');
    expect(doc.documentElement.getAttribute('data-style')).toBe('ghost');
  });

  it('falls back to the global document when passed a falsy document', () => {
    expect(() => applyVoltTheme({ dark: true }, null as unknown as Document)).not.toThrow();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-color');
    document.documentElement.removeAttribute('data-style');
  });
});
