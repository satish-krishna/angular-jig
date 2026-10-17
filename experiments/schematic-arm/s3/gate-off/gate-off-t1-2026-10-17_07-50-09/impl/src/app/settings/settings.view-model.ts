import { computed, inject, Injectable, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';

@Injectable() // no providedIn: scoped to the Settings component that provides it
export class SettingsViewModel {
  private readonly heroService = inject(HeroService);

  readonly notice = signal('');

  readonly rosterCount = computed(() => this.heroService.list().length);

  /** Puts the example roster back to its seeded state, discarding this session's changes. */
  resetRoster(): void {
    this.heroService.reset();
    this.notice.set('The example roster is back to its seeded state.');
  }
}
