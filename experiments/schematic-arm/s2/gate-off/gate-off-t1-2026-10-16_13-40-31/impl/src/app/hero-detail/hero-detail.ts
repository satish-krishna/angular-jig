import { Component, inject } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
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
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { StatTile } from '../ui/stat-tile';
import { PowerMeter } from '../ui/power-meter';
import { HeroDetailViewModel } from './hero-detail.view-model';

@Component({
  selector: 'app-hero-detail',
  imports: [
    RouterLink,
    NgIcon,
    FormField,
    FormRoot,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmFieldImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmSwitchImports,
    HlmTabsImports,
    HlmTextareaImports,
    StatTile,
    PowerMeter,
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
