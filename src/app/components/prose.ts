import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Translations, type TranslationKey, type TranslationParams } from '../i18n/translations';

type SegmentKind = 'text' | 'code' | 'strong' | 'link';

interface ProseSegment {
  readonly kind: SegmentKind;
  readonly text: string;
  /** Set only on a link. */
  readonly href: string;
}

/** The smaller code chip, for prose set at `text-xs` or inside a card. */
export const INLINE_CODE_SM = 'px-1 py-0.5 bg-muted rounded text-xs';

/**
 * `code`, **emphasis**, and [links](/docs/themes) — the three marks documentation copy
 * actually uses, in the Markdown spelling of each.
 */
const MARKED = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * One translated sentence, including whatever markup runs through the middle of it.
 *
 * Documentation prose is full of `provideVoltTheme`, of emphasis, and of links to other
 * pages. Writing that the obvious way — text, `<code>`, more text, `<a>`, more text —
 * turns one sentence into five translation keys, and five fragments cannot be translated:
 * Spanish and Ukrainian both reorder the words around the marks, and a translator handed
 * "control the theme at runtime. Both just set" has no way to know what it attaches to.
 *
 * So the whole sentence stays one key and the marks live inside it, in the notation every
 * translator already knows. The one rule a translator has to follow is to keep the marks
 * around the same idea, which is a far smaller ask than reassembling a sentence.
 *
 * There is no escape sequence. None of the site's copy contains a literal backtick, a
 * doubled asterisk or a bracket-paren pair, and an unpaired mark renders as itself rather
 * than breaking the sentence.
 */
@Component({
  selector: 'app-prose',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `@for (segment of segments(); track $index) {
    @switch (segment.kind) {
      @case ('code') {
        <code [class]="codeClass()">{{ segment.text }}</code>
      }
      @case ('strong') {
        <strong [class]="strongClass()">{{ segment.text }}</strong>
      }
      @case ('link') {
        @if (isInternal(segment.href)) {
          <a [routerLink]="path(segment.href)" [class]="linkClass()">{{ segment.text }}</a>
        } @else {
          <a [href]="segment.href" target="_blank" rel="noopener" [class]="linkClass()">{{
            segment.text
          }}</a>
        }
      }
      @default {
        {{ segment.text }}
      }
    }
  }`,
})
export class Prose {
  private readonly translations = inject(Translations);

  readonly key = input.required<TranslationKey>();
  readonly params = input<TranslationParams | undefined>(undefined);
  readonly codeClass = input<string>('px-1.5 py-0.5 bg-muted rounded');
  readonly strongClass = input<string>('text-foreground font-medium');
  readonly linkClass = input<string>('text-primary underline-offset-4 hover:underline');

  /** Site-relative links go through the router and keep the reader's language. */
  protected readonly path = this.translations.path;

  protected isInternal(href: string): boolean {
    return href.startsWith('/');
  }

  protected readonly segments = computed<ProseSegment[]>(() => {
    const source = this.translations.t(this.key(), this.params());
    const segments: ProseSegment[] = [];
    let cursor = 0;

    const push = (kind: SegmentKind, text: string, href = '') =>
      segments.push({ kind, text, href });

    for (const match of source.matchAll(MARKED)) {
      const [whole, code, strong, linkText, href] = match;

      if (match.index > cursor) {
        push('text', source.slice(cursor, match.index));
      }

      if (code !== undefined) {
        push('code', code);
      } else if (strong !== undefined) {
        push('strong', strong);
      } else {
        push('link', linkText, href);
      }

      cursor = match.index + whole.length;
    }

    if (cursor < source.length) {
      push('text', source.slice(cursor));
    }

    return segments;
  });
}
