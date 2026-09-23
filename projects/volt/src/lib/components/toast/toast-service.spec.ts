import { ApplicationRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideVoltToast, VoltToastService } from './toast-service';

@Component({
  template: `
    <button (click)="toast.success('Changes saved', { description: 'Workspace updated.' })">
      Save
    </button>
    <button (click)="toast.error('Could not save')">Fail</button>
    <button (click)="toast.show({ title: 'Quiet', dismissible: false })">Show quiet</button>
  `,
})
class ToastHost {
  protected readonly toast = inject(VoltToastService);
}

async function renderHost() {
  const result = await render(ToastHost, { providers: [provideVoltToast({ duration: 60_000 })] });
  // NgpToastManager renders into the root component's view container.
  TestBed.inject(ApplicationRef).components.push(result.fixture.componentRef);
  return result;
}

describe('VoltToastService', () => {
  afterEach(async () => {
    await TestBed.inject(VoltToastService).dismissAll();
    document.querySelectorAll('[data-ngp-toast-container]').forEach(el => el.remove());
  });

  it('shows a success toast with title and description from an event handler', async () => {
    await renderHost();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save' }));

    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent('Changes saved');
    expect(toast).toHaveTextContent('Workspace updated.');
    expect(toast).toHaveClass('bg-success/10');
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('announces errors assertively', async () => {
    await renderHost();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Fail' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save');
  });

  it('stacks multiple toasts and dismisses them all', async () => {
    await renderHost();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Fail' }));

    await waitFor(() => expect(document.querySelectorAll('volt-toast')).toHaveLength(2));
    await TestBed.inject(VoltToastService).dismissAll();
    await waitFor(() => expect(document.querySelectorAll('volt-toast')).toHaveLength(0));
  });

  it('dismisses a single toast through its ref and omits the close button when not dismissible', async () => {
    await renderHost();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Show quiet' }));

    await screen.findByText('Quiet');
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();

    const ref = TestBed.inject(VoltToastService).info('Ref toast');
    await screen.findByText('Ref toast');
    await ref.dismiss();
    await waitFor(() => expect(screen.queryByText('Ref toast')).toBeNull());
  });

  it('is a no-op on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const service = TestBed.inject(VoltToastService);

    const ref = service.success('Never rendered');
    expect(document.querySelector('volt-toast')).toBeNull();
    return expect(ref.dismiss()).resolves.toBeUndefined();
  });
});
