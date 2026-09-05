import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideSettings,
  lucideSun,
  lucideMoon,
  lucideBell,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    NgIconsModule,
    HlmCardImports,
    HlmLabelImports,
    HlmSwitchImports,
    HlmButtonImports,
  ],
  providers: [
    provideIcons({
      lucideSettings,
      lucideSun,
      lucideMoon,
      lucideBell,
    }),
  ],
  template: `
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <ng-icon name="lucideSettings" class="h-8 w-8 text-primary"></ng-icon>
          <h1 class="text-3xl font-bold text-foreground">Settings</h1>
        </div>
        <p class="text-muted-foreground">Manage your Hero Ops Console preferences</p>
      </div>

      <!-- Appearance Settings -->
      <div hlmCard class="mb-6 p-6">
        <h2 class="mb-4 text-lg font-semibold text-foreground">Appearance</h2>

        <div class="space-y-4">
          <!-- Theme Toggle -->
          <div class="flex items-center justify-between rounded-lg border border-border p-4">
            <div class="flex items-center gap-3">
              @if (theme() === 'light') {
                <ng-icon name="lucideSun" class="h-5 w-5 text-primary"></ng-icon>
              } @else {
                <ng-icon name="lucideMoon" class="h-5 w-5 text-primary"></ng-icon>
              }
              <div>
                <p class="text-sm font-medium text-foreground">Theme</p>
                <p class="text-xs text-muted-foreground">
                  {{ theme() === 'light' ? 'Light mode' : 'Dark mode' }}
                </p>
              </div>
            </div>
            <button
              hlmBtn
              variant="outline"
              size="sm"
              (click)="toggleTheme()"
              class="gap-2"
            >
              @if (theme() === 'light') {
                <ng-icon name="lucideMoon" class="h-4 w-4"></ng-icon>
                <span>Switch to Dark</span>
              } @else {
                <ng-icon name="lucideSun" class="h-4 w-4"></ng-icon>
                <span>Switch to Light</span>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div hlmCard class="mb-6 p-6">
        <h2 class="mb-4 text-lg font-semibold text-foreground">Notifications</h2>

        <div class="space-y-4">
          <!-- Mission Alerts -->
          <div class="flex items-center justify-between rounded-lg border border-border p-4">
            <div class="flex items-center gap-3">
              <ng-icon name="lucideBell" class="h-5 w-5 text-primary"></ng-icon>
              <div>
                <p class="text-sm font-medium text-foreground">Mission Alerts</p>
                <p class="text-xs text-muted-foreground">
                  Receive notifications for mission updates
                </p>
              </div>
            </div>
            <input hlmSwitch checked disabled class="h-6 w-11" />
          </div>

          <!-- Hero Status Updates -->
          <div class="flex items-center justify-between rounded-lg border border-border p-4">
            <div class="flex items-center gap-3">
              <ng-icon name="lucideBell" class="h-5 w-5 text-primary"></ng-icon>
              <div>
                <p class="text-sm font-medium text-foreground">Hero Status Updates</p>
                <p class="text-xs text-muted-foreground">
                  Alert when hero status changes
                </p>
              </div>
            </div>
            <input hlmSwitch checked disabled class="h-6 w-11" />
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div hlmCard class="p-6">
        <h2 class="mb-4 text-lg font-semibold text-foreground">About</h2>

        <div class="space-y-4 text-sm text-muted-foreground">
          <div class="flex justify-between border-b border-border pb-3">
            <span>Application</span>
            <span class="text-foreground">Hero Ops Console</span>
          </div>
          <div class="flex justify-between border-b border-border pb-3">
            <span>Version</span>
            <span class="text-foreground">1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span>Build Date</span>
            <span class="text-foreground">{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Settings {
  private themeService = inject(ThemeService);

  theme = this.themeService.theme;
  currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
