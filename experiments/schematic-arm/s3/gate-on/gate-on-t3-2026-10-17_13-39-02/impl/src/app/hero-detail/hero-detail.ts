import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideCheck,
  lucideChevronLeft,
  lucideCrosshair,
  lucideTrash2,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { PowerMeter } from '../ui/power-meter/power-meter';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { HeroDetailViewModel } from './hero-detail.view-model';

// The hero detail screen: back link, header with actions, four tabbed panels, and the retire confirmation.
@Component({
  selector: 'app-hero-detail',
  imports: [
    FormField,
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmFieldImports,
    HlmIconImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTabsImports,
    HlmTextareaImports,
    HlmTypographyImports,
    PowerMeter,
    StatTile,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({
      lucideActivity,
      lucideCheck,
      lucideChevronLeft,
      lucideCrosshair,
      lucideTrash2,
      lucideZap,
    }),
  ],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
