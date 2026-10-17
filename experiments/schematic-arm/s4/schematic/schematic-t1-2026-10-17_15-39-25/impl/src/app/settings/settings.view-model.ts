import { Injectable, computed, inject } from '@angular/core';
import { AppViewModel, type ThemeChoice } from '../app.view-model';

export interface ThemeOption {
  readonly value: ThemeChoice;
  readonly label: string;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: 'system', label: 'Match system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

// The settings screen's state. The theme lives on the shell, so this reads and writes it through AppViewModel. Component-scoped, no DOM.
@Injectable()
export class SettingsViewModel {
  private readonly app = inject(AppViewModel);

  readonly themeOptions = THEME_OPTIONS;

  // "Match system" is no saved choice, so the select shows its placeholder rather than the raw value.
  readonly themeSelection = computed(() => {
    const choice = this.app.choice();
    return choice === 'system' ? null : choice;
  });

  // hlm-select emits its value untyped, so accept only a known option and ignore anything else.
  setTheme(value: unknown): void {
    const option = THEME_OPTIONS.find((item) => item.value === value);
    if (option) {
      this.app.setTheme(option.value);
    }
  }
}
