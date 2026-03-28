import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltAvatar,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardFooter,
  VoltCardHeader,
  VoltCardTitle,
  VoltCheckbox,
  VoltInput,
  VoltLabel,
  VoltSeparator,
  VoltSwitch,
  VoltTextarea,
} from 'volt';
import { NgpAvatar, NgpAvatarImage, NgpAvatarFallback } from 'ng-primitives/avatar';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltBadge,
    VoltInput,
    VoltTextarea,
    VoltLabel,
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
    VoltCardFooter,
    VoltSeparator,
    VoltCheckbox,
    VoltSwitch,
    VoltAvatar,
    NgpAvatar,
    NgpAvatarImage,
    NgpAvatarFallback,
  ],
  templateUrl: './home.html',
})
export class Home {}
