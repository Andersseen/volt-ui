import { Component, input, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltToggleGroup } from './toggle-group';
import { VoltToggleGroupItem } from './toggle-group-item';

@Component({
  selector: 'app-toggle-group-test-wrapper',
  imports: [VoltToggleGroup, VoltToggleGroupItem],
  template: `
    <volt-toggle-group
      [(value)]="value"
      [type]="type()"
      [disabled]="disabled()"
      [allowDeselection]="allowDeselection()"
    >
      <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
      <volt-toggle-group-item value="italic" [disabled]="itemDisabled()"
        >Italic</volt-toggle-group-item
      >
      <volt-toggle-group-item value="underline">Underline</volt-toggle-group-item>
    </volt-toggle-group>
  `,
})
class ToggleGroupTestWrapper {
  readonly value = model<string[]>([]);
  readonly type = input<'single' | 'multiple'>('single');
  readonly disabled = input(false);
  readonly allowDeselection = input(true);
  readonly itemDisabled = input(false);
}

describe('VoltToggleGroup', () => {
  it('should select an item on click in single mode', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper);

    const bold = screen.getByRole('radio', { name: /Bold/i });
    expect(bold).not.toHaveAttribute('data-selected');

    await user.click(bold);
    expect(bold).toHaveAttribute('data-selected');
    expect(fixture.componentInstance.value()).toEqual(['bold']);
  });

  it('should allow multiple selections in multiple mode', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper, {
      componentInputs: { type: 'multiple' },
    });

    // ng-primitives >= 0.12x: independent toggles are buttons with aria-pressed. `radio` would
    // promise "exactly one", which multiple mode does not.
    const bold = screen.getByRole('button', { name: /Bold/i });
    const italic = screen.getByRole('button', { name: /Italic/i });
    expect(bold).toHaveAttribute('aria-pressed', 'false');

    await user.click(bold);
    await user.click(italic);

    expect(bold).toHaveAttribute('aria-pressed', 'true');
    expect(italic).toHaveAttribute('aria-pressed', 'true');
    expect(fixture.componentInstance.value()).toEqual(['bold', 'italic']);
  });

  it('should deselect when allowDeselection is true', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper, {
      componentInputs: { value: ['bold'] },
    });

    const bold = screen.getByRole('radio', { name: /Bold/i });
    expect(bold).toHaveAttribute('data-selected');

    await user.click(bold);
    expect(bold).not.toHaveAttribute('data-selected');
    expect(fixture.componentInstance.value()).toEqual([]);
  });

  it('should not deselect when allowDeselection is false', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper, {
      componentInputs: { value: ['bold'], allowDeselection: false },
    });

    const bold = screen.getByRole('radio', { name: /Bold/i });
    await user.click(bold);

    expect(bold).toHaveAttribute('data-selected');
    expect(fixture.componentInstance.value()).toEqual(['bold']);
  });

  it('should not select a disabled item', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper, {
      componentInputs: { itemDisabled: true },
    });

    const italic = screen.getByRole('radio', { name: /Italic/i });
    expect(italic).toHaveAttribute('aria-disabled', 'true');

    await user.click(italic);
    expect(fixture.componentInstance.value()).toEqual([]);
  });

  it('should move focus with arrow keys', async () => {
    const user = userEvent.setup();
    await render(ToggleGroupTestWrapper);

    const bold = screen.getByRole('radio', { name: /Bold/i });
    const italic = screen.getByRole('radio', { name: /Italic/i });

    await user.click(bold);
    await user.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(italic);
  });

  it('tabs into a single group on its selected item, as a radio group does', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper, { inputs: { value: ['underline'] } });

    const bold = screen.getByRole('radio', { name: /Bold/i });
    const underline = screen.getByRole('radio', { name: /Underline/i });
    expect(underline).toHaveAttribute('tabindex', '0');
    expect(bold).toHaveAttribute('tabindex', '-1');

    await user.tab();
    expect(document.activeElement).toBe(underline);

    // The tab stop follows a selection made from outside, without stealing focus.
    (document.activeElement as HTMLElement).blur();
    fixture.componentInstance.value.set(['bold']);
    await fixture.whenStable();
    expect(bold).toHaveAttribute('tabindex', '0');
    expect(underline).toHaveAttribute('tabindex', '-1');
    expect(document.activeElement).toBe(document.body);
  });

  it('keeps the first item as the tab stop of a multiple group', async () => {
    await render(ToggleGroupTestWrapper, {
      inputs: { type: 'multiple', value: ['underline'] },
    });

    expect(screen.getByRole('button', { name: /Bold/i })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('button', { name: /Underline/i })).toHaveAttribute('tabindex', '-1');
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-toggle-group-form-wrapper',
      imports: [ReactiveFormsModule, VoltToggleGroup, VoltToggleGroupItem],
      template: `
        <volt-toggle-group [formControl]="control">
          <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
          <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
        </volt-toggle-group>
      `,
    })
    class ToggleGroupFormWrapper {
      control = new FormControl<string[]>(['bold'], { nonNullable: true });
    }

    const { fixture } = await render(ToggleGroupFormWrapper);
    const bold = screen.getByRole('radio', { name: /Bold/i });
    const italic = screen.getByRole('radio', { name: /Italic/i });

    expect(bold).toHaveAttribute('data-selected');

    fixture.componentInstance.control.setValue(['italic']);
    fixture.detectChanges();
    expect(italic).toHaveAttribute('data-selected');

    await user.click(bold);
    expect(fixture.componentInstance.control.value).toEqual(['bold']);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(bold).toHaveAttribute('aria-disabled', 'true');

    await user.click(italic);
    expect(fixture.componentInstance.control.value).toEqual(['bold']);
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-toggle-group-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltToggleGroup, VoltToggleGroupItem],
      template: `
        <volt-toggle-group [formControl]="control">
          <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
          <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
        </volt-toggle-group>
      `,
    })
    class ToggleGroupInvalidWrapper {
      control = new FormControl<string[]>([], {
        nonNullable: true,
        validators: Validators.required,
      });
    }

    const { fixture } = await render(ToggleGroupInvalidWrapper);
    const group = fixture.nativeElement.querySelector('volt-toggle-group');

    expect(group).not.toHaveAttribute('aria-invalid');

    await user.tab();
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(group).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-toggle-group-ng-model-wrapper',
      imports: [FormsModule, VoltToggleGroup, VoltToggleGroupItem],
      template: `
        <volt-toggle-group [(ngModel)]="value">
          <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
          <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
        </volt-toggle-group>
      `,
    })
    class ToggleGroupNgModelWrapper {
      value = ['bold'];
    }

    const { fixture } = await render(ToggleGroupNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const italic = screen.getByRole('radio', { name: /Italic/i });

    await user.click(italic);

    expect(fixture.componentInstance.value).toEqual(['italic']);
  });

  it('should emit valueChange once per selection', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-toggle-group-output-wrapper',
      imports: [VoltToggleGroup, VoltToggleGroupItem],
      template: `
        <volt-toggle-group (valueChange)="changes.push($event)">
          <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
          <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
        </volt-toggle-group>
      `,
    })
    class ToggleGroupOutputWrapper {
      changes: string[][] = [];
    }

    const { fixture } = await render(ToggleGroupOutputWrapper);
    await user.click(screen.getByRole('radio', { name: /Bold/i }));

    expect(fixture.componentInstance.changes).toEqual([['bold']]);
  });

  it('names an icon-only item from aria-label written on the host', async () => {
    await render(
      `<volt-toggle-group><volt-toggle-group-item value="left" aria-label="Align left">L</volt-toggle-group-item></volt-toggle-group>`,
      { imports: [VoltToggleGroup, VoltToggleGroupItem] }
    );

    expect(screen.getByRole('radio', { name: 'Align left' })).toBeInTheDocument();
  });

  it('reshapes the inner button with buttonClass, and keeps class on the host', async () => {
    await render(
      `<volt-toggle-group>
        <volt-toggle-group-item value="p1" aria-label="Photo 1" class="photo" buttonClass="h-auto p-0"
          >img</volt-toggle-group-item
        >
      </volt-toggle-group>`,
      { imports: [VoltToggleGroup, VoltToggleGroupItem] }
    );

    const button = screen.getByRole('radio', { name: 'Photo 1' });
    // Merged with tailwind-merge: the size's height and padding give way to the consumer's.
    expect(button).toHaveClass('h-auto', 'p-0');
    expect(button).not.toHaveClass('h-control-dense', 'px-inset-sm');
    expect(button).toHaveClass('text-sm');
    expect(button.closest('volt-toggle-group-item')).toHaveClass('photo');
    expect(button).not.toHaveClass('photo');
  });
});
