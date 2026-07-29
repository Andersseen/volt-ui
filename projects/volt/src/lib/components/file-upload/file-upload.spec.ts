import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
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
    <div voltFileDropzone fileTypes="image/png" multiple>Drop files</div>
  `,
})
class FileUploadFixture {
  disabled = true;
  selected = vi.fn();
}

describe('file upload directives', () => {
  it('forward native and primitive upload state', async () => {
    const { container } = await render(FileUploadFixture);
    const input = container.querySelector('input');
    const dropzone = container.querySelector('[voltfiledropzone]');

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('accept', 'image/png');
    expect(dropzone).toHaveTextContent('Drop files');
  });
});
