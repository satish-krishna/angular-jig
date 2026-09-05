import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideSettings, lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon } from '@ng-icons/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  imports: [
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    HlmButton,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideSettings,
      lucideMoon,
      lucideSun,
    }),
  ],
  template: `
    <div class="flex flex-col gap-8 p-6">
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ng-icon name="lucideSettings" class="size-5" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-foreground">Settings</h1>
          <p class="text-sm text-muted-foreground">Manage application preferences</p>
        </div>
      </div>

      <!-- Theme Settings -->
      <div hlmCard>
        <div hlmCardHeader>
          <div hlmCardTitle>Appearance</div>
        </div>
        <div hlmCardContent class="p-6">
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-foreground">Theme</div>
                <p class="text-sm text-muted-foreground">Choose between light and dark mode</p>
              </div>
              <button hlmBtn variant="outline" (click)="toggleTheme()">
                <ng-icon [name]="isDark() ? 'lucideSun' : 'lucideMoon'" class="mr-2 size-4" />
                {{ isDark() ? 'Light Mode' : 'Dark Mode' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- About -->
      <div hlmCard>
        <div hlmCardHeader>
          <div hlmCardTitle>About</div>
        </div>
        <div hlmCardContent class="p-6">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">Application</span>
              <span class="text-sm font-medium text-foreground">Hero Ops Console</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">Version</span>
              <span class="text-sm font-medium text-foreground">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Settings {
  private readonly themeService = inject(ThemeService);

  readonly isDark = this.themeService.isDark;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
