import { Injectable, inject, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { ThemeService } from '../theme/theme.service';

/** The settings screen's state: the theme, and the reset that restores the example roster. Component-scoped. */
@Injectable()
export class SettingsViewModel {
  private readonly theme = inject(ThemeService);
  private readonly heroes = inject(HeroService);
  private readonly missions = inject(MissionService);

  readonly dark = this.theme.dark;

  /** Feedback line for the last reset. */
  readonly notice = signal('');

  toggleTheme(): void {
    this.theme.toggle();
  }

  /** Restore the example roster and clear the deployment log. Confirmed through the reset dialog. */
  resetExampleData(): void {
    this.heroes.reset();
    this.missions.reset();
    this.notice.set('Example data restored.');
  }
}
