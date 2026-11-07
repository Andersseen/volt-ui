import { ChangeDetectionStrategy, Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { VoltCheckbox } from '../checkbox';
import { VoltInput } from '../input';
import { VoltSelect, VoltSelectContent, VoltSelectItem } from '../select';
import { VoltError, VoltFormField, VoltHint, VoltLabel } from './';

/*
 * The four form families on the real platform-server, several requests in flight in one process.
 * Each request is a new application: the ids Volt generates must be numbered per application, so
 * that every request renders the same HTML and the browser, counting the same components during
 * hydration, arrives at the same ids. (ng-primitives' own `ngp-*` ids still come from a module-level
 * counter upstream, so they are compared within one response only.)
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    VoltCheckbox,
    VoltInput,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltFormField,
    VoltLabel,
    VoltHint,
    VoltError,
  ],
  template: `
    <form>
      <volt-form-field>
        <volt-label>Email</volt-label>
        <volt-input [formControl]="email" required autocomplete="email" />
        <volt-hint>Use your work email.</volt-hint>
      </volt-form-field>
      <volt-form-field>
        <volt-label>Plan</volt-label>
        <volt-select [formControl]="plan" required>
          <volt-select-content>
            <volt-select-item value="free">Free</volt-select-item>
          </volt-select-content>
        </volt-select>
      </volt-form-field>
      <volt-checkbox aria-label="Terms" [formControl]="terms" />
      <volt-checkbox aria-label="All" [indeterminate]="true" />
    </form>
  `,
})
class Root {
  email = new FormControl('', { nonNullable: true, validators: Validators.required });
  plan = new FormControl<string | null>(null, Validators.required);
  terms = new FormControl(false);
}

const render = () =>
  renderApplication(
    context => bootstrapApplication(Root, { providers: [provideServerRendering()] }, context),
    { document: '<!doctype html><html><head></head><body><app-root></app-root></body></html>' }
  );

const voltIds = (html: string) => [...html.matchAll(/id="(volt-[a-z-]+-\d+)"/g)].map(m => m[1]);

describe('form families — server rendering', () => {
  it('renders the same Volt ids on every request, also when requests overlap', async () => {
    const first = await render();
    const overlapping = await Promise.all([render(), render(), render()]);

    expect(voltIds(first)).toEqual(['volt-input-1', 'volt-checkbox-1', 'volt-checkbox-2']);
    for (const html of overlapping) {
      expect(voltIds(html)).toEqual(voltIds(first));
    }
  });

  it('wires every label and description to an element of the same response', async () => {
    const html = await render();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const element of doc.querySelectorAll(
      '[aria-labelledby], [aria-describedby], label[for]'
    )) {
      const refs = [
        ...(element.getAttribute('aria-labelledby') ?? '').split(/\s+/),
        ...(element.getAttribute('aria-describedby') ?? '').split(/\s+/),
        element.getAttribute('for') ?? '',
      ].filter(Boolean);
      for (const ref of refs) {
        expect(
          doc.getElementById(ref),
          `${ref} referenced by ${element.outerHTML.slice(0, 80)}`
        ).not.toBeNull();
      }
    }
    const email = doc.querySelector('input')!;
    expect(email.getAttribute('aria-labelledby')).toBeTruthy();
    // Parsed in another realm, so plain attribute reads rather than DOM matchers.
    expect(email.hasAttribute('required')).toBe(true);
    expect(email.hasAttribute('aria-invalid')).toBe(false);
    expect(doc.querySelector('[role="combobox"]')?.getAttribute('aria-required')).toBe('true');
    expect(doc.querySelector('[aria-label="All"]')?.getAttribute('aria-checked')).toBe('mixed');
  });
});
