import { By } from '@angular/platform-browser';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BUTTON_USAGE } from '../../../apps/web/src/app/lib/snippets/usage';
import { EditorLoaderService } from '../services/editor-loader.service';
import { CodeEditor } from './code-editor';
import { CodePanel } from './code-panel';

describe('CodePanel', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.classList.remove('dark');
  });

  it('loads the editor and renders descriptive source metadata', async () => {
    const loadEditor = vi.fn().mockResolvedValue(undefined);
    await render(CodePanel, {
      componentInputs: {
        code: 'const answer = 42;',
        cliCommand: 'npx @voltui/cli add answer',
        description: 'A documented example.',
      },
      providers: [{ provide: EditorLoaderService, useValue: { loadEditor } }],
    });

    await vi.waitFor(() => expect(loadEditor).toHaveBeenCalledOnce());
    expect(screen.getByRole('heading', { name: 'Component Source' })).toBeInTheDocument();
    expect(screen.getByText('npx @voltui/cli add answer')).toBeInTheDocument();
    expect(screen.getByText('A documented example.')).toBeInTheDocument();
  });

  it('copies the CLI command and resets its feedback', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const { fixture } = await render(CodePanel, {
      componentInputs: { code: 'example', cliCommand: 'volt add button' },
      providers: [
        { provide: EditorLoaderService, useValue: { loadEditor: () => Promise.resolve() } },
      ],
    });

    await fixture.componentInstance.copyCliCommand();
    fixture.detectChanges();
    expect(writeText).toHaveBeenCalledWith('volt add button');
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(2000);
    fixture.detectChanges();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('only accepts known tabs', async () => {
    const { fixture } = await render(CodePanel, {
      componentInputs: { code: 'example', tabbed: true },
      providers: [
        { provide: EditorLoaderService, useValue: { loadEditor: () => Promise.resolve() } },
      ],
    });

    fixture.componentInstance.onTabChange('unknown');
    expect(fixture.componentInstance.activeTab()).toBe('preview');
    fixture.componentInstance.onTabChange('code');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeTab()).toBe('code');
    expect(document.querySelector('vertex-editor-lite')).toBeInTheDocument();
  });

  it('keeps its idle state when there is no CLI command', async () => {
    const { fixture } = await render(CodePanel, {
      componentInputs: { code: 'example' },
      providers: [
        { provide: EditorLoaderService, useValue: { loadEditor: () => Promise.resolve() } },
      ],
    });

    await fixture.componentInstance.copyCliCommand();
    expect(fixture.componentInstance.cliCopied()).toBe(false);
  });

  describe('package or CLI copy', () => {
    async function setup() {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
      const view = await render(CodePanel, {
        componentInputs: { code: BUTTON_USAGE, distribution: true, title: 'Usage' },
        providers: [
          { provide: EditorLoaderService, useValue: { loadEditor: () => Promise.resolve() } },
        ],
      });
      const shown = () =>
        view.fixture.debugElement
          .query(By.directive(CodeEditor))
          .componentInstance.code() as string;
      const copy = async () => {
        // The code's own copy button (the CLI line has another one).
        await userEvent.click(
          view.container.querySelector('app-copy-button button') as HTMLElement
        );
        return writeText.mock.lastCall?.[0] as string;
      };
      return { ...view, shown, copy, writeText };
    }

    it('copies exactly the package source it shows', async () => {
      const { shown, copy } = await setup();
      expect(shown()).toBe(BUTTON_USAGE);
      expect(await copy()).toBe(shown());
    });

    it('switching to the CLI copy changes what is shown and what is copied, together', async () => {
      const { fixture, shown, copy } = await setup();
      await userEvent.click(screen.getByText('CLI copy'));
      fixture.detectChanges();
      const copyMode = shown();
      expect(copyMode).toContain("from './ui/button'");
      expect(copyMode).toContain('<button uiButton type="submit">Save</button>');
      expect(copyMode).not.toContain('@voltui/components');
      expect(await copy()).toBe(copyMode);
      // The install line follows the mode: the components the example imports.
      expect(screen.getByText('npx @voltui/cli add button spinner')).toBeInTheDocument();
      await userEvent.click(screen.getByText('npm package'));
      fixture.detectChanges();
      expect(await copy()).toBe(BUTTON_USAGE);
    });

    it('offers no switch when the panel does not ask for one', async () => {
      await render(CodePanel, {
        componentInputs: { code: BUTTON_USAGE },
        providers: [
          { provide: EditorLoaderService, useValue: { loadEditor: () => Promise.resolve() } },
        ],
      });
      expect(screen.queryByText('CLI copy')).toBeNull();
    });
  });
});
