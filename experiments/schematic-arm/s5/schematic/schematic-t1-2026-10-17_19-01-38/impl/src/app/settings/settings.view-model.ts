import { Injectable, inject } from '@angular/core';
import { AppViewModel } from '../app.view-model';

// Component-scoped (no providedIn). The theme is owned by the shell, so this reads and flips it through the app ViewModel.
@Injectable()
export class SettingsViewModel {
  private readonly app = inject(AppViewModel);

  readonly isDark = this.app.isDark;

  toggleTheme(): void {
    this.app.toggleTheme();
  }
}
