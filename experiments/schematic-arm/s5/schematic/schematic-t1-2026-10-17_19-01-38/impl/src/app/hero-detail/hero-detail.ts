import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideCrosshair, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmH2, HlmH3, HlmLarge, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { HeroForm } from '../ui/hero-form/hero-form';
import { PowerMeter } from '../ui/power-meter/power-meter';
import { HeroDetailViewModel } from './hero-detail.view-model';

@Component({
  selector: 'app-hero-detail',
  providers: [
    HeroDetailViewModel,
    provideIcons({ lucideChevronLeft, lucideCrosshair, lucidePencil, lucideTrash2 }),
  ],
  imports: [
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmIconImports,
    HlmTabsImports,
    HlmH2,
    HlmH3,
    HlmLarge,
    HlmMuted,
    HlmSmall,
    HeroForm,
    PowerMeter,
  ],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
