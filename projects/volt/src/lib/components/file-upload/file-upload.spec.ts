import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { VoltFileDropzone, VoltFileUpload } from './index';

@Component({
  imports: [VoltFileUpload, VoltFileDropzone],
  template: `
    <input
      voltFileUpload
      type="file"
      accept="image/png"
      multiple
      [disabled]="disabled"
      (selected)="selected($event)"
    />
    <volt-file-dropzone
      fileTypes="image/png"
      multiple
      (dragOverChange)="dragOverChange($event)"
      (dragOver)="dragOver($event)"
    >
      Drop files
    </volt-file-dropzone>
  `,
})
class FileUploadFixture {
  disabled = true;
  selected = vi.fn();
  dragOverChange = vi.fn();
  dragOver = vi.fn();
}

describe('file upload directives', () => {
  it('forward native and primitive upload state', async () => {
    const { container } = await render(FileUploadFixture);
    const input = container.querySelector('input');
    const dropzone = container.querySelector('volt-file-dropzone');

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('accept', 'image/png');
    expect(dropzone).toHaveTextContent('Drop files');
  });

  it('emits dragOverChange and the deprecated dragOver alias together', async () => {
    const { container, fixture } = await render(FileUploadFixture);
    const dropzone = container.querySelector('volt-file-dropzone') as HTMLElement;

    fireEvent.dragEnter(dropzone, { dataTransfer: { types: ['Files'] } });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.dragOverChange).toHaveBeenCalledWith(true);
    expect(fixture.componentInstance.dragOver).toHaveBeenCalledWith(true);
  });
});
