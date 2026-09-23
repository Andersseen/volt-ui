import { Directive, computed, input } from '@angular/core';
import { NgpAvatarImage } from 'ng-primitives/avatar';
import { cn } from '../../utils';

@Directive({
  selector: 'img[voltAvatarImage]',
  hostDirectives: [NgpAvatarImage],
  host: {
    '[class]': 'classes()',
    '[style.aspect-ratio]': "'1 / 1'",
    '[style.height]': "'100%'",
    '[style.width]': "'100%'",
    '[style.object-fit]': "'cover'",
  },
})
export class VoltAvatarImage {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('aspect-square h-full w-full object-cover', this.class())
  );
}
