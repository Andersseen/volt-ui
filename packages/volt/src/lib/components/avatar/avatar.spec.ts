import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltAvatar, VoltAvatarFallback, VoltAvatarImage } from './';

@Component({
  selector: 'app-avatar-test-wrapper',
  imports: [VoltAvatar, VoltAvatarFallback],
  template: `
    <volt-avatar>
      <span voltAvatarFallback>JD</span>
    </volt-avatar>
  `,
})
class AvatarTestWrapper {}

@Component({
  selector: 'app-avatar-image-wrapper',
  imports: [VoltAvatar, VoltAvatarImage, VoltAvatarFallback],
  template: `
    <volt-avatar>
      <img voltAvatarImage src="https://example.com/avatar.png" alt="Avatar" />
      <span voltAvatarFallback>JD</span>
    </volt-avatar>
  `,
})
class AvatarImageWrapper {}

describe('VoltAvatar', () => {
  it('should render fallback text', async () => {
    await render(AvatarTestWrapper);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render avatar container with expected classes', async () => {
    const { container } = await render(AvatarTestWrapper);

    const avatar = container.querySelector('volt-avatar');
    expect(avatar).toHaveClass('rounded-full');
    expect(avatar).toHaveClass('bg-muted');
  });

  it('should render image with avatar image directive', async () => {
    const { container } = await render(AvatarImageWrapper);

    const image = container.querySelector('img[voltAvatarImage]');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/avatar.png');
  });
});
