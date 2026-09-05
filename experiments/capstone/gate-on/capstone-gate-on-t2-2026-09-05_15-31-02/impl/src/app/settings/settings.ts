import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { SettingsViewModel } from './settings.view-model';

@Component({
  selector: 'app-settings',
  template: `
    <div class="flex flex-col gap-6 p-6">
      <!-- Page header -->
      <div>
        <h1 class="text-3xl font-bold">Settings</h1>
        <p class="text-muted-foreground mt-2">Manage Hero Ops Console preferences</p>
      </div>

      <!-- Appearance section -->
      <div class="max-w-2xl">
        <div class="bg-card border border-border rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-6">Appearance</h2>

          <div class="flex items-center justify-between py-4 border-b border-border last:border-b-0">
            <div class="flex items-center gap-3">
              <ng-icon [name]="vm.isDark() ? 'lucideMoon' : 'lucideSun'" class="w-5 h-5" />
              <div>
                <label hlmLabel class="mb-0">Dark Mode</label>
                <p class="text-sm text-muted-foreground mt-1">Toggle dark/light theme</p>
              </div>
            </div>
            <hlm-switch [checked]="vm.isDark()" (checkedChange)="vm.toggleTheme()" id="darkMode" />
          </div>
        </div>
      </div>

      <!-- About section -->
      <div class="max-w-2xl">
        <div class="bg-card border border-border rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">About</h2>
          <div class="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>Hero Ops Console v0.1.0</p>
            <p>A kitchen-sink Tour of Heroes demonstrating Angular best practices and the Hero Ops Agency mission control system.</p>
            <p>Built with Angular v22+, TypeScript, Tailwind CSS, and spartan-ng components.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [NgIcon, HlmLabel, HlmSwitchImports],
  providers: [SettingsViewModel],
})
export class Settings {
  protected readonly vm = inject(SettingsViewModel);
}
