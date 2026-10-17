import { Injectable, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { ThemeService, type ThemeChoice } from '../theme.service';

export const THEME_OPTIONS: readonly { readonly value: ThemeChoice; readonly label: string }[] = [
  { value: 'system', label: 'Match system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

// The settings screen's state and actions, with no DOM. Component-scoped: the Settings component provides it.
@Injectable()
export class SettingsViewModel {
  private readonly theme = inject(ThemeService);
  private readonly heroService = inject(HeroService);
  private readonly missionService = inject(MissionService);

  readonly themeOptions = THEME_OPTIONS;
  readonly themeChoice = this.theme.choice;

  // The select reports nothing when its selection is cleared, so an empty value keeps the current choice.
  setTheme(value: ThemeChoice | null | undefined): void {
    if (value) {
      this.theme.choose(value);
    }
  }

  // Puts back the example roster and deployments, undoing every recruit, edit and retirement.
  restoreExampleData(): void {
    this.heroService.reset();
    this.missionService.reset();
  }
}
