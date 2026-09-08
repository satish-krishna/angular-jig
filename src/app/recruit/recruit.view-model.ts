import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../hero/hero.service';
import { type HeroFormModel } from '../hero/hero.schema';

@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  // A stable value, not a factory: a function called from a template binding hands
  // the form a new object on every change detection pass, which reseeds it mid-typing.
  readonly newHeroTemplate: HeroFormModel = {
    name: '',
    alias: '',
    powerClass: 'Aerial',
    power: 50,
    bio: '',
  };

  createHero(data: HeroFormModel) {
    const hero = this.heroService.create(data);
    this.router.navigate(['/detail', hero.id]);
  }

  cancel() {
    this.router.navigate(['/roster']);
  }
}
