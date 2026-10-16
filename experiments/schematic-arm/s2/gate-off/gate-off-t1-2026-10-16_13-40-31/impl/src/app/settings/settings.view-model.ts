import { Injectable, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { THEME_PREFERENCES, ThemeService, type ThemePreference } from '../theme/theme.service';

const PREFERENCE_LABELS: Record<ThemePreference, string> = {
  system: 'Match system',
  light: 'Light',
  dark: 'Dark',
};

/** Reads and writes the theme choice, and reports the roster the console is showing. Component-scoped; no DOM. */
@Injectable()
export class SettingsViewModel {
  private readonly theme = inject(ThemeService);
  private readonly heroes = inject(HeroService);

  readonly preferenceOptions = THEME_PREFERENCES.map((value) => ({
    value,
    label: PREFERENCE_LABELS[value],
  }));

  readonly preference = this.theme.preference;
  readonly rosterCount = this.heroes.count;

  setPreference(value: ThemePreference | null | undefined): void {
    if (value) this.theme.setPreference(value);
  }
}
