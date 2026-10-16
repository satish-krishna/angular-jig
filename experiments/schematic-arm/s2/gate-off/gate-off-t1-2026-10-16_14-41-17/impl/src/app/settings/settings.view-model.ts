import { computed, inject, Injectable, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';

/**
 * State for the settings screen: the roster size and the restore-example-data
 * action. Component-scoped, so it dies with the screen.
 */
@Injectable()
export class SettingsViewModel {
  private readonly heroService = inject(HeroService);

  /** A short status line after the roster is restored. */
  readonly notice = signal('');

  readonly rosterCount = computed(() => this.heroService.heroes().length);

  /** Discard every edit, recruit and retirement, and say how many heroes are back. */
  restoreExampleRoster(): void {
    this.heroService.reset();
    this.notice.set(`Example roster restored: ${this.rosterCount()} heroes.`);
  }
}
