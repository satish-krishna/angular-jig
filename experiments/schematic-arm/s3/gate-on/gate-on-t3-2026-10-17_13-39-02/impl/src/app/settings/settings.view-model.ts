import { inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { AppViewModel } from '../app.view-model';

// Settings state: the theme choice (owned by the shell) and the reset for the session's example data.
// Component-scoped, provided by Settings. AppViewModel is provided by App, which hosts this screen.
@Injectable()
export class SettingsViewModel {
  private readonly app = inject(AppViewModel);
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);

  readonly dark = this.app.dark;

  toggleTheme(): void {
    this.app.toggleTheme();
  }

  // Puts the roster and the mission log back to the example data they started with.
  resetExampleData(): void {
    this.heroService.reset();
    this.missionService.reset();
  }
}
