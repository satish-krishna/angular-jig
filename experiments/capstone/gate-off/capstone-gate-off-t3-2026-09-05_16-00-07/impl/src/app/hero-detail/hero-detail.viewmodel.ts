import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { signal, computed, effect } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { heroEditSchema, type HeroModel } from '../domain/hero.schema';
import type { Hero } from '../domain/hero.model';

@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  readonly activeTab = signal<'overview' | 'powers' | 'missions' | 'edit'>('overview');
  readonly hero = signal<Hero | undefined>(undefined);
  readonly showRetireDialog = signal(false);
  readonly formData = signal<HeroModel | undefined>(undefined);
  readonly validationErrors = signal<Record<string, string>>({});

  readonly powerClassVariant = computed(() => {
    const h = this.hero();
    if (!h) return 'outline';
    return h.status === 'Active' ? 'default' : 'secondary';
  });

  constructor() {
    effect(() => {
      const heroId = this.route.snapshot.paramMap.get('id');
      if (heroId) {
        const h = this.heroService.getHeroById(heroId);
        this.hero.set(h);
        if (h) {
          this.formData.set({
            name: h.name,
            alias: h.alias,
            powerClass: h.powerClass,
            powerIndex: h.powerIndex,
            status: h.status,
            notes: '',
          });
        }
      }
    });
  }

  setActiveTab(tab: 'overview' | 'powers' | 'missions' | 'edit'): void {
    this.activeTab.set(tab);
  }

  openRetireDialog(): void {
    this.showRetireDialog.set(true);
  }

  closeRetireDialog(): void {
    this.showRetireDialog.set(false);
  }

  confirmRetire(): void {
    const h = this.hero();
    if (h) {
      this.heroService.removeHero(h.id);
    }
    this.closeRetireDialog();
  }

  updateFormField(fieldName: string, value: unknown): void {
    const current = this.formData();
    if (current) {
      const updated = { ...current, [fieldName]: value };
      this.formData.set(updated);
      this.validateField(fieldName, value);
    }
  }

  private validateField(fieldName: string, value: unknown): void {
    const errors = this.validationErrors();
    const schema = heroEditSchema;
    const field = Object.entries(schema.shape).find(([key]) => key === fieldName);
    if (field) {
      try {
        field[1].parse(value);
        delete errors[fieldName];
      } catch (e) {
        if (e instanceof Error) {
          errors[fieldName] = e.message;
        }
      }
    }
    this.validationErrors.set({ ...errors });
  }

  saveHero(): void {
    const data = this.formData();
    const h = this.hero();
    if (data && h) {
      const result = heroEditSchema.safeParse(data);
      if (result.success) {
        this.heroService.updateHero(h.id, result.data);
        this.hero.set(this.heroService.getHeroById(h.id));
        this.validationErrors.set({});
        this.setActiveTab('overview');
      } else {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((err: any) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        this.validationErrors.set(errors);
      }
    }
  }

  cancelEdit(): void {
    const h = this.hero();
    if (h) {
      this.formData.set({
        name: h.name,
        alias: h.alias,
        powerClass: h.powerClass,
        powerIndex: h.powerIndex,
        status: h.status,
        notes: '',
      });
    }
    this.validationErrors.set({});
    this.setActiveTab('overview');
  }
}
