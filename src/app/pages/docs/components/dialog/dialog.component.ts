import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { CodePanel } from '../../../../components/code-panel';
import { IconClose } from '../../../../icons';

@Component({
  selector: 'app-dialog-demo',
  standalone: true,
  imports: [
    NgpDialog,
    NgpDialogTrigger,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    CodePanel,
    IconClose,
  ],
  templateUrl: './dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogDemo {
  readonly dialogCode = `import { Directive } from '@angular/core';
import { 
  NgpDialogTrigger, 
  NgpDialog, 
  NgpDialogOverlay, 
  NgpDialogTitle, 
  NgpDialogDescription 
} from 'ng-primitives/dialog';

// Trigger
@Directive({
  selector: '[voltDialog]',
  hostDirectives: [NgpDialogTrigger],
})
export class VoltDialog {}

// Overlay
@Directive({
  selector: '[voltDialogOverlay]',
  hostDirectives: [NgpDialogOverlay],
})
export class VoltDialogOverlay {}

// Content
@Directive({
  selector: '[voltDialogContent]',
  hostDirectives: [NgpDialog],
})
export class VoltDialogContent {}

// Title
@Directive({
  selector: '[voltDialogTitle]',
  hostDirectives: [NgpDialogTitle],
})
export class VoltDialogTitle {}

// Description
@Directive({
  selector: '[voltDialogDescription]',
  hostDirectives: [NgpDialogDescription],
})
export class VoltDialogDescription {}`;
}
