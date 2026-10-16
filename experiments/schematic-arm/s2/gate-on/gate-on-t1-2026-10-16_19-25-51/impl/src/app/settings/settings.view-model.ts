import { inject, Injectable } from '@angular/core';
import { ThemeService, type ThemePreference } from '../theme.service';

export interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
  readonly icon: 'lucideSun' | 'lucideMoon' | 'lucideMonitor';
}

/** Exposes the theme choice to the settings screen. The stored choice lives in ThemeService. */
@Injectable()
export class SettingsViewModel {
  private readonly theme = inject(ThemeService);

  readonly preference = this.theme.preference;

  readonly options: readonly ThemeOption[] = [
    { value: 'light', label: 'Light', icon: 'lucideSun' },
    { value: 'dark', label: 'Dark', icon: 'lucideMoon' },
    { value: 'system', label: 'System', icon: 'lucideMonitor' },
  ];

  choose(value: ThemePreference): void {
    this.theme.choose(value);
  }
}
