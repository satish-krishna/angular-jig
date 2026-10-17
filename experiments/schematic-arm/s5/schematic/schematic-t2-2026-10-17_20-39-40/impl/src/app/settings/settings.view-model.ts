import { Injectable, inject } from '@angular/core';
import { AppViewModel } from '../app.view-model';

// Component-scoped (no providedIn): the Settings component provides it. The theme itself
// is owned by the shell's AppViewModel, so this reads and drives that one source of truth.
@Injectable()
export class SettingsViewModel {
  private readonly app = inject(AppViewModel);

  readonly theme = this.app.theme;
  readonly toggleLabel = this.app.themeToggleLabel;

  toggleTheme(): void {
    this.app.toggleTheme();
  }
}
