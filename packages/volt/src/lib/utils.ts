import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge, validators } from 'tailwind-merge';

const lengthVariable = (value: string) => validators.isArbitraryVariableLength(value);

/**
 * tailwind-merge has to know the utilities Volt's tokens add, or `h-control-md` and a consumer's
 * `h-12` would both survive and the winner would depend on stylesheet order.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['pill'],
      spacing: [
        'control-xs',
        'control-sm',
        'control-dense',
        'control-md',
        'control-lg',
        'inset-xs',
        'inset-sm',
        'inset-md',
        'inset-lg',
        'item-y',
        'panel',
        'card',
        'stack',
        'track',
        'thumb',
      ],
    },
    classGroups: {
      // Otherwise `ring-offset-(length:--x)` is read as a colour and dropped by `ring-offset-background`.
      'ring-offset-w': [{ 'ring-offset': [lengthVariable] }],
    },
  },
});

/**
 * Combines class names with clsx and resolves Tailwind conflicts with tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
