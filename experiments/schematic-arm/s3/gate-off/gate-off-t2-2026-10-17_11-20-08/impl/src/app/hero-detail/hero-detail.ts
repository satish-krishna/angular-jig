import { Component, inject } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideCrosshair, lucideTrash2 } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { PowerMeter } from '../ui/power-meter';
import { StatTile } from '../ui/stat-tile';
import { HeroDetailViewModel } from './hero-detail.view-model';

// One hero: header with actions, then four tabs. The Edit tab is the schema-driven form.
@Component({
  selector: 'app-hero-detail',
  imports: [
    FormField,
    FormRoot,
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
    HlmSwitchImports,
    HlmTabsImports,
    HlmTextareaImports,
    HlmTypographyImports,
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
