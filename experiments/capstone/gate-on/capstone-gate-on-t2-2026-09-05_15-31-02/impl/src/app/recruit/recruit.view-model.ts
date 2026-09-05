import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import type { PowerClass, ClearanceTier } from '../domain/hero';

@Injectable()
export class RecruitViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  readonly formName = signal('');
  readonly formAlias = signal('');
  readonly formPowerClass = signal<PowerClass>('Aerial');
  readonly formPowerIndex = signal(50);
  readonly formClearanceTier = signal<ClearanceTier>('Tier1');
  readonly formNotes = signal('');
  readonly isSaving = signal(false);

  setFormName(value: string) {
    this.formName.set(value);
  }

  setFormAlias(value: string) {
    this.formAlias.set(value);
  }

  setFormPowerClass(value: PowerClass) {
    this.formPowerClass.set(value);
  }

  setFormPowerIndex(value: number) {
    this.formPowerIndex.set(value);
  }

  setFormClearanceTier(value: ClearanceTier) {
    this.formClearanceTier.set(value);
  }

  setFormNotes(value: string) {
    this.formNotes.set(value);
  }

  async saveNewHero(): Promise<void> {
    this.isSaving.set(true);
    try {
      const currentHeroes = this.heroService.heroes();
      const nextId = (Math.max(...currentHeroes.map((h) => parseInt(h.id, 10)), 0) + 1).toString();
      const newHero = {
        id: nextId,
        name: this.formName(),
        alias: this.formAlias(),
        powerClass: this.formPowerClass(),
        powerIndex: this.formPowerIndex(),
        status: 'Active' as const,
        clearanceTier: this.formClearanceTier(),
        missionCount: 0,
        successRate: 100,
      };
      this.heroService.addHero(newHero);
      await this.router.navigate(['/roster']);
    } catch (error) {
      console.error('Recruitment failed:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/roster']);
  }
}
