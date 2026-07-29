import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorLoaderService } from '../services/editor-loader.service';
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
});
