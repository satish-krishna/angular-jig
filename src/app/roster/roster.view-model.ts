import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { Router } from '@angular/router';
import { PreferencesService } from '../preferences/preferences.service';
import type { HeroStatus } from '../hero/hero.model';

@Injectable()
export class RosterViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly preferences = inject(PreferencesService);

  readonly searchQuery = signal('');
  // linkedSignal, not signal: the user's saved default is the starting value,
  // and changing it in Settings reseeds this screen rather than being ignored
  // until a reload.
  readonly statusFilter = linkedSignal(() => this.preferences.rosterStatus());
  readonly rosterSort = computed(() => this.preferences.rosterSort());
  readonly heroes = this.heroService.heroes;

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    const sort = this.preferences.rosterSort();
    return this.heroes()
      .filter((h) => status === 'all' || h.status === status)
      .filter((h) => !q || h.name.toLowerCase().includes(q) || h.alias.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === 'name' ? a.name.localeCompare(b.name)
        : sort === 'status' ? a.status.localeCompare(b.status)
        : b.power - a.power,
      );
  });

  editHero(id: string) {
    this.router.navigate(['/detail', id]);
  }

  retireHero(id: string) {
    this.heroService.retire(id);
  }
}
