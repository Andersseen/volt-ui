import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { NgpDialogTrigger } from 'ng-primitives/dialog';
import { VoltDialog } from './dialog';
import { VoltDialogContent } from './dialog-content';
import { VoltDialogOverlay } from './dialog-overlay';
import { VoltDialogTitle } from './dialog-title';
import { VoltDialogDescription } from './dialog-description';

@Component({
  selector: 'app-dialog-test-wrapper',
  imports: [
    NgpDialogTrigger,
    VoltDialog,
    VoltDialogContent,
    VoltDialogOverlay,
    VoltDialogTitle,
    VoltDialogDescription,
  ],
  template: `
    <button [ngpDialogTrigger]="dialogTpl">Open Dialog</button>

    <ng-template #dialogTpl let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Dialog Title</h2>
        <p voltDialogDescription>Dialog description</p>
        <button (click)="close()">Close</button>
      </div>
    </ng-template>
  `,
})
class DialogTestWrapper {}

describe('VoltDialog', () => {
  it('should render the dialog trigger', async () => {
    await render(DialogTestWrapper);

    expect(screen.getByRole('button', { name: /Open Dialog/i })).toBeInTheDocument();
  });

  it('should render the dialog trigger', async () => {
    const { container } = await render(DialogTestWrapper);

    expect(container.querySelector('button')).toBeTruthy();
  });
});
