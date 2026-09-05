import { Injectable, inject, computed } from '@angular/core';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class ThreatsViewModel {
  private readonly heroService = inject(HeroService);
  readonly heroes = this.heroService.heroes;

  readonly threatenedHeroes = computed(() =>
    this.heroes().filter((h) => h.status !== 'Active'),
  );

  readonly injuredCount = computed(() =>
    this.heroes().filter((h) => h.status === 'Injured').length,
  );

  readonly reserveCount = computed(() =>
    this.heroes().filter((h) => h.status === 'Reserve').length,
  );

  readonly miaCount = computed(() =>
    this.heroes().filter((h) => h.status === 'MIA').length,
  );
}
