import { Component, inject } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideCrosshair, lucideTrash2 } from '@ng-icons/lucide';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { PowerMeter } from '../ui/power-meter/power-meter';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { HeroDetailViewModel } from './hero-detail.view-model';

@Component({
  selector: 'app-hero-detail',
  imports: [
    RouterLink,
    NgIcon,
    FormField,
    FormRoot,
    HlmAvatar,
    HlmAvatarFallback,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmDialogImports,
    HlmFieldImports,
    HlmInput,
    HlmLabel,
    HlmSelectImports,
    HlmTabsImports,
    PowerMeter,
    StatTile,
  ],
  providers: [HeroDetailViewModel, provideIcons({ lucideChevronLeft, lucideCrosshair, lucideTrash2 })],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
