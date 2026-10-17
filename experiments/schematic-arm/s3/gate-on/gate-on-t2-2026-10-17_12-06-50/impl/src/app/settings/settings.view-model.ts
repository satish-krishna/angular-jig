import { inject, Injectable, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { ThemeService, type ThemeChoice } from '../theme/theme.service';

// Settings state and logic. Component-scoped: the component provides it.
@Injectable()
export class SettingsViewModel {
  private readonly _theme = inject(ThemeService);
  private readonly _heroes = inject(HeroService);
  private readonly _missions = inject(MissionService);

  public readonly isDark = this._theme.isDark;

  // Confirmation after the example data is restored. Cleared on the next reset.
  public readonly restoreStatus = signal('');

  public chooseTheme(choice: ThemeChoice): void {
    this._theme.set(choice);
  }

  // Puts the roster and the mission log back to the example data, discarding everything entered on this visit.
  public restoreExamples(): void {
    this._heroes.restore();
    this._missions.restore();
    this.restoreStatus.set('Example roster and mission log restored.');
  }
}
