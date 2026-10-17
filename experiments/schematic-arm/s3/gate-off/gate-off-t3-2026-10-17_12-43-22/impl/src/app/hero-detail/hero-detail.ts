import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
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
import { MISSION_STATUS_VARIANT } from '../missions/mission-status';
import { heroInitials, STATUS_VARIANT } from '../ui/hero-card/hero-card';
import { PowerMeter } from '../ui/power-meter/power-meter';
import { HeroDetailViewModel } from './hero-detail.view-model';

// One hero in full: the dossier, the powers, the missions, and the edit form.
@Component({
  selector: 'app-hero-detail',
  imports: [
    RouterLink,
    FormField,
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
  ],
  providers: [HeroDetailViewModel, provideIcons({ lucideChevronLeft, lucideCrosshair, lucideTrash2 })],
  templateUrl: './hero-detail.html',
  styleUrl: './hero-detail.css',
})
export class HeroDetail {
  protected readonly vm = inject(HeroDetailViewModel);
  protected readonly initials = heroInitials;
  protected readonly statusVariant = STATUS_VARIANT;
  protected readonly missionStatusVariant = MISSION_STATUS_VARIANT;
}
