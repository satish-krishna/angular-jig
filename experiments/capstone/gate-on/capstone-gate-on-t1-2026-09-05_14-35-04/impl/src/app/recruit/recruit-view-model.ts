import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import type { HeroModel } from '../domain/hero.schema';

@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  readonly model = signal<HeroModel>({
    name: '',
    alias: '',
    powerClass: 'Aerial',
    powerIndex: 50,
    status: 'Active',
    notes: '',
    active: true,
  });

  saveHero(formValue: HeroModel): void {
    const newHero = {
      id: `${Date.now()}`,
      name: formValue.name,
      alias: formValue.alias,
      powerClass: formValue.powerClass,
      powerIndex: formValue.powerIndex,
      status: formValue.status,
      clearanceTier: 'Tier4' as const,
      missionCount: 0,
      successRate: 1.0,
    };

    this.heroService.addHero(newHero);
    this.router.navigate(['/roster']);
  }

  cancel(): void {
    this.router.navigate(['/roster']);
  }
}
