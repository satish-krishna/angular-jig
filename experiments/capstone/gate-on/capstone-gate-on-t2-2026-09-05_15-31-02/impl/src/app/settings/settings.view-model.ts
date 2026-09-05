import { Injectable, inject } from '@angular/core';
import { ThemeService } from '../core/theme.service';

@Injectable()
export class SettingsViewModel {
  private readonly themeService = inject(ThemeService);

  readonly isDark = this.themeService.isDark$;

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
