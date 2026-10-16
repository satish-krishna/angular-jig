import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideRotateCcw, lucideSun } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { SettingsViewModel } from './settings.view-model';

/**
 * Settings screen: the appearance choice and the roster reset. A thin shell over its ViewModel.
 */
@Component({
  selector: 'app-settings',
  imports: [NgIcon, HlmBadge, HlmButton, HlmCardImports],
  providers: [SettingsViewModel, provideIcons({ lucideMoon, lucideRotateCcw, lucideSun })],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold">Settings</h1>
        <p class="text-sm text-muted-foreground">Console preferences for this browser.</p>
      </header>

      @if (vm.notice(); as message) {
        <p role="status" class="text-sm text-muted-foreground">{{ message }}</p>
      }

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Appearance</h2>
            <p hlmCardDescription>
              The choice is remembered. Until you pick one, the console follows your system setting.
            </p>
          </div>
          <div hlmCardContent class="flex flex-wrap items-center justify-between gap-4">
            <p class="text-sm">
              Current theme: <span class="font-medium">{{ vm.theme() === 'dark' ? 'Dark' : 'Light' }}</span>
            </p>
            <button hlmBtn variant="outline" (click)="vm.toggleTheme()">
              <ng-icon [name]="vm.theme() === 'dark' ? 'lucideSun' : 'lucideMoon'" />
              {{ vm.themeLabel() }}
            </button>
          </div>
        </div>

        <div hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Roster data</h2>
            <p hlmCardDescription>
              Heroes are held in memory. A reload restores the example roster on its own.
            </p>
          </div>
          <div hlmCardContent class="flex flex-wrap items-center justify-between gap-4">
            <hlm-badge variant="outline">Example data</hlm-badge>
            <button hlmBtn variant="outline" (click)="vm.restoreRoster()">
              <ng-icon name="lucideRotateCcw" />
              Restore example roster
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
