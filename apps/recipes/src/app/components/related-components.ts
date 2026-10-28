import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VoltBadge } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { docsUrl } from '../lib/site';
import type { CatalogAtom } from '../lib/catalog';

/**
 * The Volt components an entry is built from, each a link to its documentation.
 *
 * Component docs live on the Volt UI site, so these are absolute URLs on that origin, in the
 * language the visitor is reading. They are plain anchors: the router here knows nothing about
 * `/docs/components/*`.
 */
@Component({
  selector: 'app-related-components',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge],
  template: `
    <ul class="mt-2 flex flex-wrap gap-1.5">
      @for (link of links(); track link.name) {
        <li>
          <a
            [href]="link.href"
            class="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <volt-badge
              variant="outline"
              class="font-mono text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >{{ link.name }}</volt-badge
            >
          </a>
        </li>
      }
    </ul>
  `,
})
export class RelatedComponents {
  private readonly translations = injectAppI18n();

  readonly atoms = input.required<readonly CatalogAtom[]>();

  protected readonly links = computed(() =>
    this.atoms().map(atom => ({
      name: atom.name,
      href: docsUrl(this.translations.locale(), atom.path),
    }))
  );
}
