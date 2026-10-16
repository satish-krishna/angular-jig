import { computed, inject, Injectable } from '@angular/core';
import { ThemeService } from '../shell/theme.service';
import type { ThemeChoice } from '../shell/theme.service';

/** 'system' follows the operating system and stores no choice; the other two are stored. */
export type ThemeOption = 'system' | ThemeChoice;

export interface ThemeOptionView {
  readonly value: ThemeOption;
  readonly label: string;
  readonly icon: string;
}

const THEME_OPTIONS: readonly ThemeOptionView[] = [
  { value: 'system', label: 'System', icon: 'lucideMonitor' },
  { value: 'light', label: 'Light', icon: 'lucideSun' },
  { value: 'dark', label: 'Dark', icon: 'lucideMoon' },
];

/** Component-scoped: the settings screen provides it and reads the shared theme through the service. */
@Injectable()
export class SettingsViewModel {
  private readonly theme = inject(ThemeService);

  readonly options = THEME_OPTIONS;

  /** The option in effect as the user last set it. No stored choice reads as 'system'. */
  readonly selected = computed<ThemeOption>(() => this.theme.preference() ?? 'system');

  choose(option: ThemeOption): void {
    this.theme.setPreference(option === 'system' ? null : option);
  }
}
