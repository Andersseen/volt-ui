import { isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { EditorLoaderService } from '../services/editor-loader.service';
import { Translations } from '../i18n/translations';

export type CodeEditorLanguage = 'typescript' | 'javascript' | 'css' | 'html' | 'json';

/**
 * Read-only syntax-highlighted code view backed by the lazily loaded
 * `vertex-editor-lite` web component.
 *
 * Owns the whole editor lifecycle — script loading, pushing the value in once the
 * element reports `ready`, and following the site's light/dark theme — so callers only
 * pass code and a language. Keeping this in one place is what stops a second copy from
 * drifting onto the wrong theme, which is exactly what happened to the Create Theme
 * page while it hand-rolled its own `<pre>` block.
 */
@Component({
  selector: 'app-code-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (editorLoaded()) {
      <vertex-editor-lite
        [attr.language]="language()"
        [attr.theme]="editorTheme()"
        [attr.line-numbers]="lineNumbers() ? 'true' : 'false'"
        [style.display]="'block'"
        [style.height]="height()"
        [style.overflow]="'auto'"
      ></vertex-editor-lite>
    } @else {
      <div class="flex items-center justify-center" [style.height]="height()">
        <div class="animate-pulse text-muted-foreground">{{ t('ui.codeEditor.loading') }}</div>
      </div>
    }
  `,
})
export class CodeEditor implements OnInit {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly code = input.required<string>();
  readonly language = input<CodeEditorLanguage>('typescript');
  readonly height = input<string>('400px');
  readonly lineNumbers = input<boolean>(true);

  protected readonly editorTheme = signal<'light' | 'dark'>('light');
  protected readonly editorLoaded = signal(false);

  private readonly hostElement = inject(ElementRef).nativeElement as HTMLElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly editorLoader = inject(EditorLoaderService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly readyListenerAttached = new WeakSet<HTMLElement>();

  private readonly syncEditorEffect = afterRenderEffect(() => {
    const code = this.code();
    const theme = this.editorTheme();
    // Re-run once the editor element actually lands in the DOM.
    void this.editorLoaded();

    const editor = this.hostElement.querySelector('vertex-editor-lite') as
      | (HTMLElement & { _ready?: boolean; setValue?: (value: string) => void })
      | null;
    if (!editor) return;

    if (editor._ready && typeof editor.setValue === 'function') {
      editor.setValue(code);
      editor.setAttribute('theme', theme);
    } else if (!this.readyListenerAttached.has(editor)) {
      this.readyListenerAttached.add(editor);
      editor.addEventListener(
        'ready',
        () => {
          editor.setValue?.(this.code());
          editor.setAttribute('theme', this.editorTheme());
        },
        { once: true }
      );
    }
  });

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    await this.editorLoader.loadEditor();
    this.editorLoaded.set(true);

    this.syncThemeFromDocument();
    const observer = new MutationObserver(() => this.syncThemeFromDocument());
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private syncThemeFromDocument(): void {
    this.editorTheme.set(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }
}
