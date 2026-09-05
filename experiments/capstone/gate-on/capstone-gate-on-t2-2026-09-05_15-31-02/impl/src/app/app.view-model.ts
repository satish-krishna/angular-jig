import { Injectable, inject } from '@angular/core';
import { ThemeService } from './core/theme.service';

@Injectable()
export class AppViewModel {
  private readonly theme = inject(ThemeService);
  readonly isDark = this.theme.isDark$;

  toggleTheme() {
    this.theme.toggleTheme();
  }
}
