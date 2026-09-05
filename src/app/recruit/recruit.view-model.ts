import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../hero/hero.service';
import { type HeroFormModel } from '../hero/hero.schema';

@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  readonly newHeroTemplate = () => ({
    name: '',
    alias: '',
    powerClass: 'Aerial' as const,
    power: 50,
  });

  createHero(data: HeroFormModel) {
    const hero = this.heroService.create(data);
    this.router.navigate(['/detail', hero.id]);
  }

  cancel() {
    this.router.navigate(['/roster']);
  }
}
