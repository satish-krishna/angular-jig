import { Injectable, inject, computed, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { heroSchema, type HeroModel } from '../domain/hero.schema';

@Injectable()
export class HeroDetailViewModel {
  private heroService = inject(HeroService);

  private heroIdSignal = signal<string | null>(null);
  private activeTabSignal = signal<'overview' | 'powers' | 'missions' | 'edit'>('overview');
  private showRetireDialogSignal = signal<boolean>(false);
  private editFormSignal = signal<Partial<HeroModel>>({});

  heroId = this.heroIdSignal.asReadonly();
  activeTab = this.activeTabSignal.asReadonly();
  showRetireDialog = this.showRetireDialogSignal.asReadonly();
  editForm = this.editFormSignal.asReadonly();

  hero = computed(() => {
    const id = this.heroIdSignal();
    if (!id) return undefined;
    return this.heroService.getHeroById(id);
  });

  // Quick reference for template
  heroName = computed(() => this.hero()?.name ?? '');
  heroAlias = computed(() => this.hero()?.alias ?? '');
  heroId$ = computed(() => this.hero()?.id ?? '');

  // Overview tab: field summary stats
  fieldSummary = computed(() => {
    const h = this.hero();
    if (!h) return { missions: 0, successRate: 0, power: 0 };
    return {
      missions: h.missionCount,
      successRate: h.successRate,
      power: h.powerIndex,
    };
  });

  // Edit tab form schema
  schema = heroSchema;

  setHeroId(id: string): void {
    this.heroIdSignal.set(id);
    // Initialize form with current hero data
    const h = this.hero();
    if (h) {
      this.editFormSignal.set({
        name: h.name,
        alias: h.alias,
        powerClass: h.powerClass,
        powerIndex: h.powerIndex,
        status: h.status,
      });
    }
  }

  setActiveTab(tab: 'overview' | 'powers' | 'missions' | 'edit'): void {
    this.activeTabSignal.set(tab);
  }

  openRetireDialog(): void {
    this.showRetireDialogSignal.set(true);
  }

  closeRetireDialog(): void {
    this.showRetireDialogSignal.set(false);
  }

  confirmRetire(): void {
    const id = this.heroIdSignal();
    if (id) {
      this.heroService.updateHero(id, { status: 'MIA' });
      this.showRetireDialogSignal.set(false);
    }
  }

  updateEditForm(updates: Partial<HeroModel>): void {
    this.editFormSignal.update((current) => ({ ...current, ...updates }));
  }

  saveHero(): void {
    const id = this.heroIdSignal();
    if (id) {
      this.heroService.updateHero(id, this.editFormSignal());
      this.activeTabSignal.set('overview');
    }
  }

  cancelEdit(): void {
    const h = this.hero();
    if (h) {
      this.editFormSignal.set({
        name: h.name,
        alias: h.alias,
        powerClass: h.powerClass,
        powerIndex: h.powerIndex,
        status: h.status,
      });
    }
    this.activeTabSignal.set('overview');
  }
}
