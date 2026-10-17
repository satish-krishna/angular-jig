import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideTarget } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmH3, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  imports: [NgIcon, HlmIcon, HlmBadgeImports, HlmButtonImports, HlmTableImports, HlmH3, HlmMuted, HlmSmall],
  providers: [MissionsViewModel, provideIcons({ lucideCircleCheck, lucideTarget })],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
