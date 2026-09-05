import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { HeroService } from '../domain/hero.service';
import { heroEditSchema, HeroModel } from '../domain/hero-edit.schema';
import { formMeta } from '../forms/zod-meta';

@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);

  readonly heroId = signal<string>('');

  readonly hero = computed(() => {
    const id = this.heroId();
    return id ? this.heroService.getHeroById(id) : null;
  });

  readonly selectedTab = signal<'overview' | 'powers' | 'missions' | 'edit'>('overview');
  readonly isSaving = signal(false);
  readonly isRetiring = signal(false);
  readonly showRetireDialog = signal(false);

  readonly modelValue = signal<HeroModel>({
    name: '',
    alias: '',
    powerClass: 'Aerial',
    powerIndex: 0,
    status: 'Active',
    notes: '',
  });

  readonly heroForm = form(
    this.modelValue,
    (path) => validateStandardSchema(path, heroEditSchema),
  );

  readonly fieldsMeta = computed(() => formMeta(heroEditSchema));

  constructor() {
    // Load hero data when heroId changes
    effect(() => {
      const hero = this.hero();
      if (hero) {
        this.modelValue.set({
          name: hero.name,
          alias: hero.alias,
          powerClass: hero.powerClass,
          powerIndex: hero.powerIndex,
          status: hero.status,
          notes: '',
        });
      }
    });
  }

  setHeroId(id: string): void {
    this.heroId.set(id);
  }

  setSelectedTab(tab: 'overview' | 'powers' | 'missions' | 'edit'): void {
    this.selectedTab.set(tab);
  }

  saveHero(): void {
    this.isSaving.set(true);
    try {
      const id = this.heroId();
      if (id) {
        this.heroService.updateHero(id, this.modelValue());
        this.selectedTab.set('overview');
      }
    } finally {
      this.isSaving.set(false);
    }
  }

  openRetireDialog(): void {
    this.showRetireDialog.set(true);
  }

  closeRetireDialog(): void {
    this.showRetireDialog.set(false);
  }

  async retireHero(): Promise<void> {
    this.isRetiring.set(true);
    try {
      const id = this.heroId();
      if (id) {
        this.heroService.removeHero(id);
      }
    } finally {
      this.isRetiring.set(false);
      this.showRetireDialog.set(false);
    }
  }

  cancelEdit(): void {
    const hero = this.hero();
    if (hero) {
      this.modelValue.set({
        name: hero.name,
        alias: hero.alias,
        powerClass: hero.powerClass,
        powerIndex: hero.powerIndex,
        status: hero.status,
        notes: '',
      });
      this.selectedTab.set('overview');
    }
  }
}
