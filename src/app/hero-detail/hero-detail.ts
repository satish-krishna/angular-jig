import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HeroForm } from '../ui/hero-form';
import { PowerMeter } from '../ui/power-meter';
import { HeroDetailViewModel } from './hero-detail.view-model';

@Component({
  selector: 'app-hero-detail',
  providers: [HeroDetailViewModel],
  imports: [
    DatePipe,
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmTabsImports,
    HeroForm,
    PowerMeter,
  ],
  templateUrl: './hero-detail.html',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
