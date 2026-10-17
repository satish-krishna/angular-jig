import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { HeroFormModel } from '../hero/hero.schema';
import { HeroService } from '../hero/hero.service';

@Injectable()
export class RecruitViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  private readonly rosterRoute = '/roster';

  /** Set on the first recruit, so a second submit before the navigation lands cannot create a duplicate. */
  private recruited = false;

  recruit(model: HeroFormModel): void {
    if (this.recruited) return;
    this.recruited = true;
    const hero = this.heroes.create(model);
    void this.router.navigate(['/detail', hero.id]);
  }

  cancel(): void {
    void this.router.navigateByUrl(this.rosterRoute);
  }
}
