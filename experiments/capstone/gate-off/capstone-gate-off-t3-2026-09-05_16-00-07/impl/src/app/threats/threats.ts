import { Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideShieldAlert } from '@ng-icons/lucide';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-threats',
  imports: [
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
    }),
  ],
  template: `
    <div class="flex flex-col gap-8 p-6">
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
          <ng-icon name="lucideShieldAlert" class="size-5" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-foreground">Active Threats</h1>
          <p class="text-sm text-muted-foreground">Monitor and track ongoing threats to security</p>
        </div>
      </div>

      <div hlmCard class="max-w-2xl">
        <div hlmCardHeader>
          <div hlmCardTitle>Coming Soon</div>
        </div>
        <div hlmCardContent class="p-6">
          <p class="text-muted-foreground">
            The threats management system is under development. This module will allow you to track, prioritize, and respond to threats to the hero roster's areas of operation.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Threats {}
