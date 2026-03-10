import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
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
  VoltAvatarImage,
  VoltAvatarFallback,
} from 'volt';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltBadge,
    VoltInput,
    VoltTextarea,

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
    VoltAvatarImage,
    VoltAvatarFallback,
  ],
  templateUrl: './home.html',
})
export class Home {}
