import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditorLoaderService {
  private static scriptLoaded = false;
  private static loadPromise: Promise<void> | null = null;

  loadEditor(): Promise<void> {
    if (EditorLoaderService.scriptLoaded) {
      return Promise.resolve();
    }

    if (EditorLoaderService.loadPromise) {
      return EditorLoaderService.loadPromise;
    }

    EditorLoaderService.loadPromise = this.loadScript();
    return EditorLoaderService.loadPromise;
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already defined
      if (customElements.get('vertex-editor')) {
        EditorLoaderService.scriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'web-editor.min.js';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        EditorLoaderService.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load vertex-editor script'));
      };

      document.head.appendChild(script);
    });
  }
}
