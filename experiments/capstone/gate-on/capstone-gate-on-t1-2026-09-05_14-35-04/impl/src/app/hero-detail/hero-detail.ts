import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, FormRoot, FormField, validateStandardSchema } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmFieldImports, HlmFieldError } from '@spartan-ng/helm/field';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideCrosshair,
  lucideTrash2,
  lucideCheck,
  lucideTriangleAlert,
  lucideShieldAlert,
} from '@ng-icons/lucide';
import { HeroDetailViewModel } from './hero-detail-view-model';
import { heroEditSchema } from '../domain/hero.schema';

@Component({
  selector: 'app-hero-detail',
  imports: [
    CommonModule,
    NgIconsModule,
    FormRoot,
    FormField,
    HlmFieldError,
    HlmButtonImports,
    HlmCardImports,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmLabelImports,
    HlmInputImports,
    HlmSelectImports,
    HlmDialogImports,
    HlmTextareaImports,
    HlmFieldImports,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({
      lucideChevronLeft,
      lucideCrosshair,
      lucideTrash2,
      lucideCheck,
      lucideTriangleAlert,
      lucideShieldAlert,
    }),
  ],
  templateUrl: './hero-detail.html',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
  protected readonly Math = Math;

  protected readonly heroForm = form(
    this.vm.model,
    (path) => validateStandardSchema(path, heroEditSchema)
  );

  openRetireDialog(): void {
    this.vm.showRetireDialog.set(true);
  }

  confirmRetire(): void {
    this.vm.confirmRetire();
  }

  onSaveHero(): void {
    if (!this.isFormValid()) return;
    this.vm.saveHero(this.vm.model());
  }

  private isFormValid(): boolean {
    return !this.heroForm.name().errors().length &&
           !this.heroForm.alias().errors().length &&
           !this.heroForm.powerClass().errors().length &&
           !this.heroForm.powerIndex().errors().length &&
           !this.heroForm.status().errors().length;
  }

  statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'MIA':
      case 'Reserve':
        return 'outline';
      default:
        return 'default';
    }
  }
}
