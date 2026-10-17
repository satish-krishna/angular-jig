import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCrosshair, lucideZap } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmH1, HlmH2, HlmH3, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  imports: [
    RouterLink,
    NgIcon,
    HlmBadgeImports,
    HlmCardImports,
    HlmIconImports,
    HlmH1,
    HlmH2,
    HlmH3,
    HlmMuted,
    HlmSmall,
    StatTile,
  ],
  providers: [MissionsViewModel, provideIcons({ lucideActivity, lucideCrosshair, lucideZap })],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
