import { Injectable, inject, signal } from '@angular/core';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import { HeroService } from '../domain/hero.service';

const BLANK: HeroModel = { name: '', alias: '', powerClass: 'Aerial', powerIndex: 0, clearance: 'Tier 1' };

// The recruit screen's form and its enrolment action, with no DOM. Component-scoped: the Recruit component provides it.
@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  private readonly draft = signal<HeroModel>({ ...BLANK });
  readonly heroForm = form(this.draft, (path) => validateStandardSchema(path, heroSchema));

  // Enrolling adds the hero to the shared roster, then opens their detail screen.
  enroll(): void {
    void submit(this.heroForm, async () => {
      // Parse, not the raw draft: the schema trims the text fields before they reach the roster.
      const hero = this.heroService.recruit(heroSchema.parse(this.draft()));
      void this.router.navigate(['/detail', hero.id]);
    });
  }
}
