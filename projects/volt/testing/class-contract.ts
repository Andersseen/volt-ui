import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';

/**
 * Shared checks for the Volt styling contract (specs/patterns/component.md):
 * a consumer `class` is merged over the defaults with `cn()` and lands on the element that
 * visually owns those styles.
 *
 * Lives outside `projects/volt/src` so the library build never compiles it.
 */
export interface ClassContractCase {
  /** Test title, e.g. `'VoltCardContent'`. */
  readonly name: string;
  /** Markup that puts `class="${cls}"` on the Volt element under test. */
  readonly template: (cls: string) => string;
  readonly imports: unknown[];
  readonly providers?: unknown[];
  /** The element that must receive the consumer classes. */
  readonly target: (root: HTMLElement) => Element | null;
  /**
   * For wrappers around a native element: the host, which must not keep the consumer classes
   * (otherwise padding, borders and margins apply twice).
   */
  readonly host?: (root: HTMLElement) => Element | null;
  /** `[consumer, replaced]` — a consumer utility and the default it must replace, e.g. `['p-3', 'p-6']`. */
  readonly conflict: readonly [string, string];
  /** Default classes carrying behaviour that a consumer class must not erase. */
  readonly keep: readonly string[];
}

const RESPONSIVE = 'md:mt-4';
const ARBITRARY_PROPERTY = '[mask-type:alpha]';
const ARBITRARY_VALUE = 'min-w-[13ch]';

async function renderCase(c: ClassContractCase, cls: string): Promise<HTMLElement> {
  const { container } = await render(c.template(cls), {
    imports: c.imports as never[],
    providers: c.providers as never[],
  });
  return container as HTMLElement;
}

function mustFind(element: Element | null, what: string): Element {
  if (!element) throw new Error(`class contract: ${what} element not found`);
  return element;
}

export function describeClassContract(c: ClassContractCase): void {
  describe(`${c.name} — class contract`, () => {
    const [consumer, replaced] = c.conflict;
    const cls = `${consumer} ${RESPONSIVE} ${ARBITRARY_PROPERTY} ${ARBITRARY_VALUE}`;

    it('puts consumer classes on the element that owns the styles', async () => {
      const root = await renderCase(c, cls);
      const target = mustFind(c.target(root), 'target');

      for (const token of cls.split(' ')) {
        expect(target, `missing "${token}"`).toHaveClass(token);
      }
    });

    it('overrides the conflicting default through tailwind-merge', async () => {
      const root = await renderCase(c, cls);
      const target = mustFind(c.target(root), 'target');

      expect(target).toHaveClass(consumer);
      expect(target).not.toHaveClass(replaced);
    });

    it('keeps the default classes that carry behaviour', async () => {
      const root = await renderCase(c, cls);
      const target = mustFind(c.target(root), 'target');

      for (const token of c.keep) {
        expect(target, `lost "${token}"`).toHaveClass(token);
      }
    });

    if (c.host) {
      it('does not leave the consumer classes on the wrapper host', async () => {
        const root = await renderCase(c, cls);
        const host = mustFind(c.host!(root), 'host');

        for (const token of cls.split(' ')) {
          expect(host, `host still has "${token}"`).not.toHaveClass(token);
        }
      });
    }
  });
}
