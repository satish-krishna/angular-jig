import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideTriangleAlert, lucideUsers } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmH1, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  imports: [NgIcon, HlmIcon, HlmBadge, HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle, HlmH1, HlmMuted, HlmSmall, StatTile],
  providers: [MissionsViewModel, provideIcons({ lucideActivity, lucideTriangleAlert, lucideUsers })],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
