import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VoltAvatar, VoltAvatarFallback, VoltAvatarImage, VoltButton, VoltInput } from 'volt';

// ==========================================
// 1. Chat Message
// ==========================================
@Component({
  selector: 'app-chat-message',
  imports: [VoltAvatar, VoltAvatarFallback, VoltAvatarImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-3" [class.flex-row-reverse]="isOwn()">
      <volt-avatar class="h-8 w-8 shrink-0">
        <img voltAvatarImage [src]="avatar()" [alt]="sender()" />
        <volt-avatar-fallback>{{ initials() }}</volt-avatar-fallback>
      </volt-avatar>
      <div class="max-w-[70%]" [class.text-right]="isOwn()">
        <div class="flex items-center gap-2 mb-1" [class.justify-end]="isOwn()">
          <span class="text-xs font-medium">{{ sender() }}</span>
          <span class="text-[10px] text-muted-foreground">{{ time() }}</span>
        </div>
        <div
          class="inline-block rounded-2xl px-4 py-2 text-sm"
          [class.bg-primary]="isOwn()"
          [class.text-primary-foreground]="isOwn()"
          [class.bg-muted]="!isOwn()"
        >
          {{ text() }}
        </div>
      </div>
    </div>
  `,
})
export class ChatMessage {
  readonly text = input.required<string>();
  readonly sender = input.required<string>();
  readonly initials = input.required<string>();
  readonly avatar = input.required<string>();
  readonly time = input.required<string>();
  readonly isOwn = input<boolean>(false);
}

// ==========================================
// 2. Chat List Item
// ==========================================
@Component({
  selector: 'app-chat-list-item',
  imports: [VoltAvatar, VoltAvatarFallback, VoltAvatarImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
      [class.bg-accent]="active()"
    >
      <div class="relative">
        <volt-avatar class="h-10 w-10">
          <img voltAvatarImage [src]="avatar()" [alt]="name()" />
          <volt-avatar-fallback>{{ initials() }}</volt-avatar-fallback>
        </volt-avatar>
        @if (online()) {
          <span
            class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-background"
          ></span>
        }
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium truncate">{{ name() }}</span>
          <span class="text-[10px] text-muted-foreground">{{ time() }}</span>
        </div>
        <p class="text-xs text-muted-foreground truncate">{{ preview() }}</p>
      </div>
      @if (unread() > 0) {
        <span
          class="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground"
          >{{ unread() }}</span
        >
      }
    </div>
  `,
})
export class ChatListItem {
  readonly name = input.required<string>();
  readonly initials = input.required<string>();
  readonly avatar = input.required<string>();
  readonly preview = input.required<string>();
  readonly time = input.required<string>();
  readonly online = input<boolean>(false);
  readonly unread = input<number>(0);
  readonly active = input<boolean>(false);
}

// ==========================================
// 3. Chat Demo
// ==========================================
@Component({
  selector: 'app-chat-demo',
  imports: [
    VoltAvatar,
    VoltAvatarFallback,
    VoltAvatarImage,
    VoltButton,
    VoltInput,
    ChatMessage,
    ChatListItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="h-[700px] border border-border rounded-lg overflow-hidden flex bg-background relative"
    >
      <!-- Sidebar -->
      <div class="w-72 border-r border-border flex flex-col shrink-0">
        <!-- Search -->
        <div class="p-3 border-b border-border">
          <volt-input placeholder="Search conversations..." class="h-9 text-sm" />
        </div>

        <!-- Chat List -->
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <app-chat-list-item
            name="Sarah Miller"
            initials="SM"
            avatar="https://i.pravatar.cc/150?u=2"
            preview="Can you review the PR?"
            time="2m"
            [online]="true"
            [unread]="3"
            [active]="true"
          />
          <app-chat-list-item
            name="Design Team"
            initials="DT"
            avatar="https://i.pravatar.cc/150?u=team"
            preview="Mike: Updated the mockups"
            time="15m"
            [unread]="12"
          />
          <app-chat-list-item
            name="Mike Kim"
            initials="MK"
            avatar="https://i.pravatar.cc/150?u=3"
            preview="Thanks! Looks good"
            time="1h"
            [online]="true"
          />
          <app-chat-list-item
            name="Anna Lee"
            initials="AL"
            avatar="https://i.pravatar.cc/150?u=4"
            preview="Meeting at 3pm"
            time="2h"
          />
          <app-chat-list-item
            name="Robert Johnson"
            initials="RJ"
            avatar="https://i.pravatar.cc/150?u=5"
            preview="Deployed to staging"
            time="Yesterday"
          />
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Chat Header -->
        <div class="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
          <div class="flex items-center gap-3">
            <volt-avatar class="h-8 w-8">
              <img voltAvatarImage src="https://i.pravatar.cc/150?u=2" alt="SM" />
              <volt-avatar-fallback>SM</volt-avatar-fallback>
            </volt-avatar>
            <div>
              <p class="text-sm font-medium">Sarah Miller</p>
              <p class="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <volt-button variant="ghost" size="icon" class="h-8 w-8">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </volt-button>
            <volt-button variant="ghost" size="icon" class="h-8 w-8">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </volt-button>
            <volt-button variant="ghost" size="icon" class="h-8 w-8">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </volt-button>
          </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div class="text-center">
            <span class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Today</span>
          </div>

          <app-chat-message
            text="Hey! Did you get a chance to look at the new designs?"
            sender="Sarah Miller"
            initials="SM"
            avatar="https://i.pravatar.cc/150?u=2"
            time="9:30 AM"
          />

          <app-chat-message
            text="Yes, they look great! I especially like the color palette."
            sender="You"
            initials="ME"
            avatar="https://i.pravatar.cc/150?u=me"
            time="9:32 AM"
            [isOwn]="true"
          />

          <app-chat-message
            text="Awesome! Can you review the PR when you have a moment?"
            sender="Sarah Miller"
            initials="SM"
            avatar="https://i.pravatar.cc/150?u=2"
            time="9:33 AM"
          />

          <app-chat-message
            text="Sure thing, I'll check it out after lunch."
            sender="You"
            initials="ME"
            avatar="https://i.pravatar.cc/150?u=me"
            time="9:35 AM"
            [isOwn]="true"
          />

          <app-chat-message
            text="Perfect, thanks! Also, don't forget we have the standup at 2pm."
            sender="Sarah Miller"
            initials="SM"
            avatar="https://i.pravatar.cc/150?u=2"
            time="9:36 AM"
          />
        </div>

        <!-- Input -->
        <div class="h-16 border-t border-border px-4 flex items-center gap-2 shrink-0">
          <volt-button variant="ghost" size="icon" class="h-8 w-8 shrink-0">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </volt-button>
          <volt-input placeholder="Type a message..." class="flex-1 h-9" />
          <volt-button size="sm" class="shrink-0">
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Send
          </volt-button>
        </div>
      </div>
    </div>
  `,
})
export class ChatDemo {}

// ==========================================
// 4. Docs Page
// ==========================================
@Component({
  selector: 'app-docs-chat',
  imports: [ChatDemo],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 w-full h-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Chat / Messages</h1>
      <p class="text-lg text-muted-foreground mb-8">
        A split-view messaging layout with conversation list and real-time chat interface.
      </p>

      <app-chat-demo />

      <div class="mt-16 space-y-4">
        <h2 class="text-xl font-bold tracking-tight">Usage</h2>
        <p class="text-muted-foreground text-sm">
          This layout features a sidebar with searchable conversation list, active chat area with
          message bubbles, and an input bar. Supports own vs. received messages, online indicators,
          and unread badges. Great for support chats, team messaging, and social apps.
        </p>
      </div>
    </div>
  `,
})
export default class DocsChat {}
