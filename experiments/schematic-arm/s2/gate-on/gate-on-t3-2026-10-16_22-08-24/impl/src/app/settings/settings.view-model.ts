import { Injectable, computed, inject, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { ThemeService } from '../theme/theme.service';

/**
 * The settings screen's state: the theme choice, and the action that puts the
 * example records back to their starting values.
 */
@Injectable()
export class SettingsViewModel {
  private readonly themeService = inject(ThemeService);
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);

  readonly isDark = computed(() => this.themeService.theme() === 'dark');
  readonly themeName = computed(() => (this.isDark() ? 'Dark' : 'Light'));

  /** Feedback after a restore. */
  readonly notice = signal('');

  toggleTheme(): void {
    this.themeService.toggle();
  }

  /** Put the roster and the deployment record back to the example data, discarding every edit. */
  restoreExampleData(): void {
    this.heroService.reset();
    this.missionService.reset();
    this.notice.set('Example records restored. Edits, recruits and retirements are cleared.');
  }
}
