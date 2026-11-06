import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LivePlayground } from './live-playground';

const code = () => screen.getByLabelText('Generated code').textContent!;

describe('LivePlayground', () => {
  it('starts with a preview and code that describe the same alert', async () => {
    await render(LivePlayground);

    expect(screen.getByText('Heads up', { selector: 'volt-alert-title' })).toBeInTheDocument();
    expect(code()).toContain('<volt-alert variant="info">');
    expect(code()).toContain('<volt-alert-title>Heads up</volt-alert-title>');
  });

  it('updates the preview and the code when the variant changes', async () => {
    await render(LivePlayground);

    await userEvent.click(screen.getByRole('radio', { name: 'destructive' }));

    expect(document.querySelector('volt-alert')).toHaveAttribute('data-variant', 'destructive');
    expect(code()).toContain('variant="destructive"');
  });

  it('updates both when text is typed', async () => {
    await render(LivePlayground);
    const title = screen.getByLabelText('Title');

    await userEvent.clear(title);
    await userEvent.type(title, 'Saved');

    expect(screen.getByText('Saved', { selector: 'volt-alert-title' })).toBeInTheDocument();
    expect(code()).toContain('<volt-alert-title>Saved</volt-alert-title>');
  });

  it('escapes characters that would break the pasted template', async () => {
    await render(LivePlayground);
    const description = screen.getByLabelText('Description');

    await userEvent.clear(description);
    await userEvent.paste('a <b> {x} @y');

    expect(code()).toContain('a &lt;b&gt; &#123;x&#125; &#64;y');
  });

  it('drops the action from the preview and the code together', async () => {
    await render(LivePlayground);
    expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Action button' }));

    expect(screen.queryByRole('button', { name: 'Upgrade' })).not.toBeInTheDocument();
    expect(code()).not.toContain('slot="action"');
  });

  it('sets the live-region role only when asked to announce', async () => {
    await render(LivePlayground);
    expect(document.querySelector('volt-alert')).not.toHaveAttribute('role');

    await userEvent.click(screen.getByRole('radio', { name: 'alert' }));

    expect(document.querySelector('volt-alert')).toHaveAttribute('role', 'alert');
    expect(code()).toContain('role="alert"');
  });

  it('resets every control, the preview and the code', async () => {
    await render(LivePlayground);
    await userEvent.click(screen.getByRole('radio', { name: 'warning' }));
    await userEvent.click(screen.getByRole('switch', { name: 'Action button' }));

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(code()).toContain('variant="info"');
    expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
  });

  it('copies exactly the code on screen', async () => {
    const user = userEvent.setup();
    await render(LivePlayground);
    await user.click(screen.getByRole('radio', { name: 'success' }));

    await user.click(screen.getByRole('button', { name: 'Copy code' }));

    expect(await navigator.clipboard.readText()).toBe(code());
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });
});
