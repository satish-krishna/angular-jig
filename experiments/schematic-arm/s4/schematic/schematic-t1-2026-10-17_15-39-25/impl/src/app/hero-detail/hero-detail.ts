import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideCrosshair, lucideTrash2 } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HeroForm } from '../ui/hero-form/hero-form';
import { PowerMeter } from '../ui/power-meter/power-meter';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { HeroDetailViewModel } from './hero-detail.view-model';

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
    HeroForm,
    PowerMeter,
    StatTile,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({ lucideChevronLeft, lucideCrosshair, lucideTrash2 }),
  ],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
