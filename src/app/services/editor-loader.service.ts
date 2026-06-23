import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const SCRIPT_NAME = 'web-editor-lite.min.js';
const TAG_NAME = 'vertex-editor-lite';

@Injectable({
  providedIn: 'root',
})
export class EditorLoaderService {
  private static loaded = false;
  private static promise: Promise<void> | null = null;

  private readonly platformId = inject(PLATFORM_ID);

  loadEditor(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (EditorLoaderService.loaded) {
      return Promise.resolve();
    }

    if (EditorLoaderService.promise) {
      return EditorLoaderService.promise;
    }

    const promise = this.loadScript();
    EditorLoaderService.promise = promise;
    return promise;
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Guard against SSR / non-browser environments
      if (typeof customElements === 'undefined' || typeof document === 'undefined') {
        resolve();
        return;
      }

      // Check if already defined
      if (customElements.get(TAG_NAME)) {
        EditorLoaderService.loaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = SCRIPT_NAME;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        EditorLoaderService.loaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load ${SCRIPT_NAME}`));
      };

      document.head.appendChild(script);
    });
  }
}
