import { computed, inject, Injectable, signal } from '@angular/core';
import { AppViewModel } from '../app.view-model';
import { HeroService } from '../domain/hero.service';

// Component-scoped: provided by Settings. Reads the theme from the shell's view-model it sits under.
@Injectable()
export class SettingsViewModel {
  private readonly heroService = inject(HeroService);
  private readonly shell = inject(AppViewModel);

  readonly isDark = this.shell.isDark;
  readonly rosterCount = computed(() => this.heroService.heroes().length);

  /** Confirmation line shown after an action. Empty when there is nothing to report. */
  readonly notice = signal('');

  toggleTheme(): void {
    this.shell.toggleTheme();
    this.notice.set(this.isDark() ? 'Dark theme on.' : 'Light theme on.');
  }

  /** Discards every edit, recruit, and retirement made this session. */
  restoreExampleRoster(): void {
    this.heroService.reset();
    this.notice.set('Example roster restored.');
  }
}
