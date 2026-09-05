import { Injectable, inject, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import { Hero } from '../domain/hero.model';
import { heroSchema, HeroModel } from '../domain/hero.schema';

@Injectable()
export class HeroDetailViewModel {
  private heroService = inject(HeroService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private heroIdSignal = signal<string>('');
  private formValuesSignal = signal<Partial<HeroModel>>({});
  private formErrorsSignal = signal<Record<string, string>>({});
  private isEditingSignal = signal(false);
  private isSubmittingSignal = signal(false);

  hero = computed(() => {
    const id = this.heroIdSignal();
    if (!id) return undefined;
    return this.heroService.byId(id);
  });

  isEditing = this.isEditingSignal.asReadonly();
  isSubmitting = this.isSubmittingSignal.asReadonly();
  formErrors = this.formErrorsSignal.asReadonly();

  constructor() {
    this.route.params.subscribe((params) => {
      this.heroIdSignal.set(params['id'] || '');
      const hero = this.hero();
      if (hero) {
        this.resetForm(hero);
      }
    });
  }

  private resetForm(hero: Hero): void {
    this.formValuesSignal.set({
      name: hero.name,
      alias: hero.alias,
      powerClass: hero.powerClass as any,
      powerIndex: hero.powerIndex,
      bio: hero.bio || '',
      status: hero.status as any,
    });
    this.formErrorsSignal.set({});
  }

  startEditing(): void {
    this.isEditingSignal.set(true);
  }

  cancelEditing(): void {
    const hero = this.hero();
    if (hero) {
      this.resetForm(hero);
    }
    this.isEditingSignal.set(false);
  }

  setFormValue<K extends keyof HeroModel>(key: K, value: HeroModel[K]): void {
    this.formValuesSignal.update((values) => ({
      ...values,
      [key]: value,
    }));
  }

  async saveForm(): Promise<void> {
    const hero = this.hero();
    if (!hero) return;

    this.isSubmittingSignal.set(true);
    const formValues = this.formValuesSignal();

    try {
      const validatedData = await heroSchema.parseAsync(formValues);
      this.heroService.update(hero.id, validatedData);
      this.resetForm(this.hero()!);
      this.isEditingSignal.set(false);
      this.formErrorsSignal.set({});
    } catch (error: unknown) {
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as any;
        const errors: Record<string, string> = {};
        zodError.issues?.forEach((issue: any) => {
          const path = issue.path?.[0] || 'form';
          errors[path] = issue.message;
        });
        this.formErrorsSignal.set(errors);
      }
    } finally {
      this.isSubmittingSignal.set(false);
    }
  }

  retire(): void {
    const hero = this.hero();
    if (!hero) return;
    this.heroService.retire(hero.id);
    this.router.navigate(['/roster']);
  }

  getFormValue<K extends keyof HeroModel>(key: K): HeroModel[K] | undefined {
    return this.formValuesSignal()[key];
  }
}
