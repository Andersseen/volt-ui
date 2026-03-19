import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltAvatarImage,
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
  VoltSeparator,
  VoltSwitch,
  VoltTextarea,
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
