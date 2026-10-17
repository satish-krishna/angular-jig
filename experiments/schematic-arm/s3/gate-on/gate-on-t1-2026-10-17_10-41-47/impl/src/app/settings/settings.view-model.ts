import { inject, Injectable } from '@angular/core';
import { ThemeService } from '../theme/theme.service';

/** Component-scoped ViewModel for the Settings screen: the console's appearance preference. */
@Injectable()
export class SettingsViewModel {
  private readonly _theme = inject(ThemeService);

  readonly isDark = this._theme.isDark;

  /** Records the user's theme choice. The switch reports the new state directly. */
  setDark(dark: boolean): void {
    this._theme.setDark(dark);
  }
}
