import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CodePanel } from '@shared/components/code-panel';
import { Prose } from '@shared/components/prose';
import { injectAppI18n } from '@shared/i18n/i18n';
import { COMPOSITIONS } from '@shared/lib/compositions.generated';
import { DistributionModeStore } from '@shared/services/distribution-mode';
import { externalPackages } from '../lib/snippets/consumer-source';

export interface CompositionFile {
  /** The file name the composition imports it by, e.g. `contact-map.data.ts`. */
  readonly name: string;
  readonly code: string;
}

/**
 * The source of a block, layout or pattern, in the distribution mode the visitor picks.
 *
 * Package mode is the source as authored (`@voltui/components`, `Volt*`, `volt-*`). Copy mode is
 * the same text through the transform the docs site and `pnpm check:copied-source` use: `Ui*`,
 * `ui-*`, imports from `../ui/<component>` (the composition lives in `src/app/<folder>/`, the
 * components in `src/app/ui/`, where `volt add` writes them). The panel shows and copies one value,
 * the supporting files follow the same toggle, and the install commands change with it.
 */
@Component({
  selector: 'app-composition-source',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodePanel, Prose],
  template: `
    <app-code-panel
      [title]="title()"
      [code]="code()"
      [cliCommand]="packageCommand()"
      [description]="description()"
      [installPackages]="packages()"
      uiDir="../ui"
      distribution
    />
    @if (mode() === 'copy') {
      <app-prose
        class="block text-sm text-muted-foreground"
        [text]="t('gallery.copyPlacement', { folder: folder() })"
      />
    }

    <!-- Files the composition imports beside itself (generated data), copied along with it. -->
    @for (file of files(); track file.name) {
      <app-code-panel
        [title]="file.name"
        [code]="file.code"
        uiDir="../ui"
        distribution
        [showModeToggle]="false"
      />
    }
  `,
  host: { class: 'block space-y-8' },
})
export class CompositionSource {
  private readonly translations = injectAppI18n();
  protected readonly t = this.translations.t;
  protected readonly mode = inject(DistributionModeStore).mode;

  /** Catalog id (`blocks/hero`): names the folder the copy goes into. */
  readonly entryId = input.required<string>();
  readonly title = input.required<string>();
  readonly code = input.required<string>();
  readonly description = input<string>('');
  readonly files = input<readonly CompositionFile[]>([]);

  /** The folder the generated manifest records for this entry; the slug if it has none. */
  protected readonly folder = computed(() => {
    const id = this.entryId();
    return COMPOSITIONS.find(entry => entry.id === id)?.folder ?? id.split('/').pop() ?? id;
  });

  /** npm packages beyond Volt UI, read off every file so a new import cannot be left out. */
  protected readonly packages = computed(() => [
    ...new Set(
      [this.code(), ...this.files().map(file => file.code)]
        .flatMap(source => externalPackages(source))
        .filter(p => p !== '@voltui/components')
    ),
  ]);

  protected readonly packageCommand = computed(() =>
    ['pnpm add', '@voltui/components', ...this.packages()].join(' ')
  );
}
