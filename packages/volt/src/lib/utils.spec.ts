import { describe, expect, it } from 'vitest';
import { cn } from './utils';

/** A consumer `class` must beat a token utility the same way it beats a plain Tailwind one. */
describe('cn with token utilities', () => {
  it.each([
    ['h-control-md', 'h-12'],
    ['size-control-dense', 'size-12'],
    ['px-inset-md', 'px-2'],
    ['py-item-y', 'py-0'],
    ['p-card', 'p-3'],
    ['gap-stack', 'gap-1'],
    ['space-y-stack', 'space-y-1'],
    ['rounded-pill', 'rounded-none'],
    ['border-(length:--border-width)', 'border-4'],
    ['border-(length:--volt-control-border-width)', 'border-0'],
    ['focus-visible:ring-(length:--ring-width)', 'focus-visible:ring-4'],
    ['focus-visible:ring-offset-(length:--ring-offset-width)', 'focus-visible:ring-offset-0'],
    ['data-[press]:scale-(--volt-press-scale)', 'data-[press]:scale-100'],
  ])('%s gives way to %s', (token, consumer) => {
    expect(cn(token, consumer)).toBe(consumer);
  });

  it('keeps a width next to the colour of the same utility', () => {
    const classes =
      'ring-offset-background focus-visible:ring-(length:--ring-width) focus-visible:ring-ring';
    expect(cn(classes)).toBe(classes);
    expect(cn('ring-offset-(length:--ring-offset-width) ring-offset-background')).toBe(
      'ring-offset-(length:--ring-offset-width) ring-offset-background'
    );
    expect(cn('border-(length:--border-width) border-border')).toBe(
      'border-(length:--border-width) border-border'
    );
  });
});
