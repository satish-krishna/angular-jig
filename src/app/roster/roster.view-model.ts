import { Injectable, computed, inject, signal } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { Router } from '@angular/router';
import type { HeroStatus } from '../hero/hero.model';

@Injectable()
export class RosterViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  readonly searchQuery = signal('');
  readonly statusFilter = signal<HeroStatus | 'all'>('all');
  readonly heroes = this.heroService.heroes;

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    return this.heroes()
      .filter((h) => status === 'all' || h.status === status)
      .filter((h) => !q || h.name.toLowerCase().includes(q) || h.alias.toLowerCase().includes(q))
      .sort((a, b) => b.power - a.power);
  });

  editHero(id: string) {
    this.router.navigate(['/detail', id]);
  }

  async retireHero(id: string) {
    this.heroService.retire(id);
  }
}
