import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EditorLoaderService } from './editor-loader.service';

interface LoaderState {
  loaded: boolean;
  promise: Promise<void> | null;
}

describe('EditorLoaderService', () => {
  const state = EditorLoaderService as unknown as LoaderState;

  beforeEach(() => {
    state.loaded = false;
    state.promise = null;
  });

  afterEach(() => {
    document.querySelectorAll('script[src="web-editor-lite.min.js"]').forEach(script => {
      script.remove();
    });
    TestBed.resetTestingModule();
  });

  function createService(platformId: object | string = 'browser') {
    TestBed.configureTestingModule({
      providers: [EditorLoaderService, { provide: PLATFORM_ID, useValue: platformId }],
    });
    return TestBed.inject(EditorLoaderService);
  }

  it('does nothing outside the browser', async () => {
    await expect(createService('server').loadEditor()).resolves.toBeUndefined();
    expect(document.querySelector('script[src="web-editor-lite.min.js"]')).toBeNull();
  });

  it('loads the editor script once and reuses the in-flight promise', async () => {
    const service = createService();
    const first = service.loadEditor();
    const second = service.loadEditor();
    const script = document.querySelector<HTMLScriptElement>(
      'script[src="web-editor-lite.min.js"]'
    );

    expect(script).not.toBeNull();
    expect(second).toBe(first);
    script?.onload?.(new Event('load'));
    await expect(first).resolves.toBeUndefined();
    await expect(service.loadEditor()).resolves.toBeUndefined();
  });

  it('rejects when the editor script cannot be loaded', async () => {
    const promise = createService().loadEditor();
    const script = document.querySelector<HTMLScriptElement>(
      'script[src="web-editor-lite.min.js"]'
    );

    script?.onerror?.(new Event('error'));
    await expect(promise).rejects.toThrow('Failed to load web-editor-lite.min.js');
  });
});
