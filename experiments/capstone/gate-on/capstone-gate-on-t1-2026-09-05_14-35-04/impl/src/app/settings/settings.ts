import { Component, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { SettingsViewModel } from './settings-view-model';

@Component({
  selector: 'app-settings',
  imports: [HlmCardImports, HlmButtonImports, HlmLabelImports],
  providers: [SettingsViewModel],
  template: `
    <div class="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Settings</h1>
        <p class="text-muted-foreground mt-2">Manage console preferences</p>
      </div>

      <div class="max-w-2xl flex flex-col gap-4">
        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Appearance</h3>
          </div>
          <div hlmCardContent class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <p class="font-medium text-foreground">Dark Mode</p>
                <p hlmLabel>Toggle dark theme for the console</p>
              </div>
              <button hlmBtn variant="outline" (click)="vm.toggleTheme()">
                {{ vm.themeService.isDark() ? 'On' : 'Off' }}
              </button>
            </div>
          </div>
        </div>

        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>About</h3>
          </div>
          <div hlmCardContent class="flex flex-col gap-2">
            <p hlmLabel>Hero Ops Console v1.0.0</p>
            <p hlmLabel>A kitchen-sink Tour of Heroes demonstrating modern Angular patterns.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
