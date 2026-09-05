import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import { heroSchema, HeroModel } from '../domain/hero.schema';

@Injectable()
export class RecruitViewModel {
  private heroService = inject(HeroService);
  private router = inject(Router);

  private formValuesSignal = signal<Partial<HeroModel>>({
    name: '',
    alias: '',
    powerClass: 'Aerial',
    powerIndex: 50,
    bio: '',
    status: 'Active',
  });
  private formErrorsSignal = signal<Record<string, string>>({});
  private isSubmittingSignal = signal(false);

  formErrors = this.formErrorsSignal.asReadonly();
  isSubmitting = this.isSubmittingSignal.asReadonly();

  setFormValue<K extends keyof HeroModel>(key: K, value: HeroModel[K]): void {
    this.formValuesSignal.update((values) => ({
      ...values,
      [key]: value,
    }));
  }

  getFormValue<K extends keyof HeroModel>(key: K): HeroModel[K] | undefined {
    return this.formValuesSignal()[key];
  }

  async submitForm(): Promise<void> {
    this.isSubmittingSignal.set(true);
    const formValues = this.formValuesSignal();

    try {
      const validatedData = await heroSchema.parseAsync(formValues);
      this.heroService.add(validatedData as Omit<any, 'id'>);
      this.formErrorsSignal.set({});
      this.router.navigate(['/roster']);
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

  resetForm(): void {
    this.formValuesSignal.set({
      name: '',
      alias: '',
      powerClass: 'Aerial',
      powerIndex: 50,
      bio: '',
      status: 'Active',
    });
    this.formErrorsSignal.set({});
  }
}
