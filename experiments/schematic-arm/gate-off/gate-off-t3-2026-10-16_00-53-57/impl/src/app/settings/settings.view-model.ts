import { Injectable, computed, inject } from '@angular/core';
import { AppShellViewModel } from '../app-shell.view-model';
import { HeroService } from '../domain/hero.service';

// Owns the settings screen: the theme choice (held by the shell, which App provides) and a read-only view of the data store. Component-scoped, no DOM.
@Injectable()
export class SettingsViewModel {
  private readonly shell = inject(AppShellViewModel);
  private readonly heroService = inject(HeroService);

  readonly isDark = this.shell.isDark;

  readonly recordCount = computed(() => this.heroService.heroes().length);

  setDark(dark: boolean): void {
    this.shell.setTheme(dark ? 'dark' : 'light');
  }
}
