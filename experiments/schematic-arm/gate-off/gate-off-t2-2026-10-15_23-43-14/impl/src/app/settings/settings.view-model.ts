import { Injectable, computed, inject, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { ThemeService } from '../shell/theme.service';

/**
 * State for the settings screen: the theme choice and the roster reset. Component-scoped; the
 * theme itself is owned by the shared ThemeService, so the top-bar toggle and this screen agree.
 */
@Injectable()
export class SettingsViewModel {
  private readonly _theme = inject(ThemeService);
  private readonly _heroes = inject(HeroService);

  public readonly theme = this._theme.theme;

  public readonly themeLabel = computed(() =>
    this.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );

  /** Feedback line for the last action taken. */
  public readonly notice = signal<string | null>(null);

  public toggleTheme(): void {
    this._theme.toggle();
  }

  /** Puts the example roster back, discarding every edit made this session. */
  public restoreRoster(): void {
    this._heroes.reset();
    this.notice.set('The example roster is restored. Edits made this session are discarded.');
  }
}
