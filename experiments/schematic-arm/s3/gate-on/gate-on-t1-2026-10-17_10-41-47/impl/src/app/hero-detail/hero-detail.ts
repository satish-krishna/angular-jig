import { Component, inject } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideChevronLeft, lucideCrosshair, lucideTarget, lucideTrash2, lucideZap } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelect, HlmSelectContent, HlmSelectItem, HlmSelectPortal, HlmSelectTrigger, HlmSelectValue } from '@spartan-ng/helm/select';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmH1, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { PowerMeter } from '../ui/power-meter/power-meter';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { HeroDetailViewModel } from './hero-detail.view-model';

@Component({
  selector: 'app-hero-detail',
  imports: [
    RouterLink,
    FormField,
    FormRoot,
    NgIcon,
    HlmIcon,
    HlmAvatarImports,
    HlmBadge,
    HlmButton,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmDialogImports,
    HlmFieldImports,
    HlmInput,
    HlmSelect,
    HlmSelectContent,
    HlmSelectItem,
    HlmSelectPortal,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmTabsImports,
    HlmTextarea,
    HlmH1,
    HlmMuted,
    HlmSmall,
    PowerMeter,
    StatTile,
  ],
  providers: [
    HeroDetailViewModel,
    provideIcons({ lucideActivity, lucideChevronLeft, lucideCrosshair, lucideTarget, lucideTrash2, lucideZap }),
  ],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
}
