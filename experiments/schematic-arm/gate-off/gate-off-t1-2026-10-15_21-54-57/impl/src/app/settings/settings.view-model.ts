import { Injectable, inject } from '@angular/core';
import { AppViewModel, type ThemeChoice } from '../app.view-model';
import { HeroService } from '../domain/hero.service';
import { ThreatService } from '../domain/threat.service';

/** The theme choices the settings screen offers, in the order they are shown. */
const THEME_OPTIONS: readonly { readonly value: ThemeChoice; readonly label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match system' },
];

// Owns the settings screen's state. The theme itself lives in the shell's AppViewModel, which this reads and writes.
// Component-scoped (provided by Settings), so no providedIn.
@Injectable()
export class SettingsViewModel {
  private readonly app = inject(AppViewModel);
  private readonly heroes = inject(HeroService);
  private readonly threats = inject(ThreatService);

  readonly themeChoice = this.app.themeChoice;
  readonly themeOptions = THEME_OPTIONS;
  readonly heroCount = this.heroes.count;
  readonly openThreats = this.threats.openCount;

  setTheme(choice: ThemeChoice): void {
    this.app.setTheme(choice);
  }
}
