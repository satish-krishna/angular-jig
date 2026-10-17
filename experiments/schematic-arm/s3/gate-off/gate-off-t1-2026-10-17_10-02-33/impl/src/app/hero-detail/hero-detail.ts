import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronLeft, lucideCrosshair, lucideTrash2 } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HeroFields } from '../ui/hero-fields';
import { PowerMeter } from '../ui/power-meter';
import { HeroDetailViewModel } from './hero-detail.view-model';

// The hero detail screen: a header with the deploy and retire actions, and four tabs. All state lives in HeroDetailViewModel.
@Component({
  selector: 'app-hero-detail',
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
    HlmTypographyImports,
    HeroFields,
    PowerMeter,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({ lucideCheck, lucideChevronLeft, lucideCrosshair, lucideTrash2 }),
  ],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
