import { Directive } from '@angular/core';
import { NgpAvatarImage } from 'ng-primitives/avatar';

@Directive({
  selector: 'img[voltAvatarImage]',
  hostDirectives: [NgpAvatarImage],
  host: {
    class: 'aspect-square h-full w-full object-cover',
    '[style.aspect-ratio]': "'1 / 1'",
    '[style.height]': "'100%'",
    '[style.width]': "'100%'",
    '[style.object-fit]': "'cover'",
  },
})
export class VoltAvatarImage {}
