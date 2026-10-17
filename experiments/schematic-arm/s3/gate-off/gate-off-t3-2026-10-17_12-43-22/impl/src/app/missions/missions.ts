import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideX } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { MISSION_STATUS_VARIANT } from './mission-status';
import { MissionsViewModel } from './missions.view-model';

// The mission log: every deployment, with the result recorded against the hero when it is settled.
@Component({
  selector: 'app-missions',
  imports: [
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmIconImports,
    HlmTableImports,
    HlmTypographyImports,
  ],
  providers: [MissionsViewModel, provideIcons({ lucideCircleCheck, lucideX })],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
  protected readonly statusVariant = MISSION_STATUS_VARIANT;
}
