import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { ShellViewModel } from '../shell/shell.view-model';

@Injectable()
export class SettingsViewModel {
  private readonly shell = inject(ShellViewModel);
  private readonly heroes = inject(HeroService);

  /** The theme choice lives in the shell, so the topbar and this screen always agree. */
  readonly theme = this.shell.theme;
  readonly themeLabel = this.shell.themeLabel;

  readonly rosterCount = computed(() => this.heroes.heroes().length);

  toggleTheme(): void {
    this.shell.toggleTheme();
  }
}
