import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { HeroFormModel } from '../hero/hero.schema';
import { HeroService } from '../hero/hero.service';

// Component-scoped (no providedIn): the Recruit component provides it.
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  /** Enrols the hero on the shared roster, then opens their new dossier. */
  recruit(model: HeroFormModel): void {
    const hero = this.heroService.create(model);
    void this.router.navigate(['/detail', hero.id]);
  }

  cancel(): void {
    void this.router.navigate(['/roster']);
  }
}
