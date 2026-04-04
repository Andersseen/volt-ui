import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  VoltLabel,
  VoltSeparator,
  VoltSwitch,
  VoltTextarea,
} from 'volt';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
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
  ],
  templateUrl: './home.html',
})
export class Home {}
