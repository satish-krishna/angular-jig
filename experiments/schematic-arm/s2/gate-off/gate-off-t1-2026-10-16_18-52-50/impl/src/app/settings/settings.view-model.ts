import { inject, Injectable } from '@angular/core';
import { ThemeService, type ThemePreference } from '../shell/theme.service';

export interface PreferenceOption {
  readonly value: ThemePreference;
  readonly label: string;
}

const THEME_OPTIONS: readonly PreferenceOption[] = [
  { value: 'system', label: 'Match system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_OPTIONS.some((option) => option.value === value);
}

/** Settings state: the theme preference, read from and written to the shared theme service. */
@Injectable()
export class SettingsViewModel {
  private readonly theme = inject(ThemeService);

  readonly themeOptions = THEME_OPTIONS;
  readonly themePreference = this.theme.preference;

  setThemePreference(value: unknown): void {
    if (isThemePreference(value)) this.theme.setPreference(value);
  }
}
