import { Injectable, inject } from '@angular/core';
import { AppViewModel } from '../app.view-model';
import { CLEARANCE_RESPONSE, CLEARANCE_TIERS } from '../hero/hero-presentation';

/** Every piece of copy the settings screen shows. The template binds to these and never repeats them. */
const SETTINGS_TEXT = {
  title: 'Console settings',
  intro: 'Preferences for this console and reference for the clearance ladder.',
  appearance: 'Appearance',
  appearanceHint:
    'The theme choice is saved on this device. Until you choose one, the system setting applies.',
  switchToLight: 'Switch to light theme',
  switchToDark: 'Switch to dark theme',
  currentLight: 'Light',
  currentDark: 'Dark',
  clearance: 'Clearance tiers',
  data: 'Example data',
  dataHint:
    'The roster is example data held in memory. Edits last until the page is reloaded.',
} as const;

/**
 * Settings state. The theme belongs to the shell, so this screen reads and flips the shell's
 * theme rather than keeping a second copy of it.
 */
@Injectable()
export class SettingsViewModel {
  private readonly shell = inject(AppViewModel);

  readonly text = SETTINGS_TEXT;
  readonly isDark = this.shell.isDark;
  readonly clearanceRules = CLEARANCE_TIERS.map((tier) => ({ tier, response: CLEARANCE_RESPONSE[tier] }));

  toggleTheme(): void {
    this.shell.toggleTheme();
  }
}
