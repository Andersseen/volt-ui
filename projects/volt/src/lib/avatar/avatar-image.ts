import { Directive, input } from '@angular/core';
import { NgpAvatarImage } from 'ng-primitives/avatar';

@Directive({
  selector: '[voltAvatarImage]',
  host: {
    class: 'aspect-square h-full w-full object-cover',
  },
})
export class VoltAvatarImage {
  private ngpAvatarImage = NgpAvatarImage;
}
