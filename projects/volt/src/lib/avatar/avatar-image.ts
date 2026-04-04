import { Directive } from '@angular/core';
import { NgpAvatarImage } from 'ng-primitives/avatar';

@Directive({
  selector: 'img[voltAvatarImage]',
  hostDirectives: [NgpAvatarImage],
  host: {
    class: 'aspect-square h-full w-full object-cover',
  },
})
export class VoltAvatarImage {}
