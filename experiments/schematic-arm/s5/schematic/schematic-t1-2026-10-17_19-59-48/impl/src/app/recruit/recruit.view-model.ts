import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { HeroFormModel } from '../hero/hero.schema';
import { HeroService } from '../hero/hero.service';

/** Every piece of copy the recruit screen shows. The template binds to these and never repeats them. */
const RECRUIT_TEXT = {
  title: 'Recruit a hero',
  intro: 'Add a new hero to the roster. A new record starts Active at Tier 1 clearance.',
  submit: 'Recruit',
  rosterRoute: '/roster',
} as const;

/** Recruit state: the new-hero form hands its model here, and the record lands in the shared roster. */
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  readonly text = RECRUIT_TEXT;

  recruit(model: HeroFormModel): void {
    const hero = this.heroService.create(model);
    void this.router.navigate(['/detail', hero.id]);
  }

  cancel(): void {
    void this.router.navigateByUrl(this.text.rosterRoute);
  }
}
