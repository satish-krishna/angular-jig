import { Injectable, computed, inject } from '@angular/core';
import { ThemeService, type Theme } from '../shell/theme.service';

@Injectable()
export class SettingsViewModel {
  private readonly themes = inject(ThemeService);

  readonly dark = computed(() => this.themes.theme() === 'dark');

  choose(theme: Theme): void {
    this.themes.set(theme);
  }
}
