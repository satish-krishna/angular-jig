import { Injectable, computed, inject, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';

// Component-scoped (the Settings component provides it). Reports the roster the
// console is showing and restores the example roster, which every other screen reads.
@Injectable()
export class SettingsViewModel {
  private readonly heroes = inject(HeroService);

  readonly rosterCount = computed(() => this.heroes.roster().length);

  // Status line for the last action. Empty when there is nothing to report.
  readonly notice = signal('');

  resetRoster(): void {
    this.heroes.reset();
    this.notice.set(`Roster restored to ${this.heroes.roster().length} example heroes.`);
  }
}
