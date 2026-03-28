import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltAvatar } from 'volt';
import { NgpAvatar, NgpAvatarImage, NgpAvatarFallback } from 'ng-primitives/avatar';

@Component({
  selector: 'app-avatar-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltAvatar, NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Avatar</h1>
        <p class="text-lg text-muted-foreground mt-2">
          An image element with a fallback for representing the user.
        </p>
      </div>

      <div
        class="border rounded-xl border-border/50 p-6 md:p-10 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden min-h-[300px]"
      >
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>

        <div class="relative z-10 flex gap-4">
          <volt-avatar ngpAvatar>
            <img
              ngpAvatarImage
              src="https://github.com/shadcn.png"
              alt="@shadcn"
              class="aspect-square h-full w-full object-cover"
            />
            <span
              ngpAvatarFallback
              class="flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-foreground"
              >CN</span
            >
          </volt-avatar>
          <volt-avatar ngpAvatar>
            <img
              ngpAvatarImage
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              alt="@janedoe"
              class="aspect-square h-full w-full object-cover"
            />
            <span
              ngpAvatarFallback
              class="flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-foreground"
              >JD</span
            >
          </volt-avatar>
          <volt-avatar ngpAvatar>
            <span
              ngpAvatarFallback
              class="flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-foreground"
              >AP</span
            >
          </volt-avatar>
        </div>
      </div>
    </div>
  `,
})
export class AvatarDemo {}
