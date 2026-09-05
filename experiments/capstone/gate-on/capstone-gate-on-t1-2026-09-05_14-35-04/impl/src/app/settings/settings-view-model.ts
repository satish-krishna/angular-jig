import { Injectable, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Injectable()
export class SettingsViewModel {
  readonly themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
