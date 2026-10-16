import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCrosshair } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { MissionsViewModel } from './missions.view-model';

/** The missions screen: headline figures, the live deployments, and the heroes ready to deploy. */
@Component({
  selector: 'app-missions',
  imports: [NgIcon, HlmBadgeImports, HlmButtonImports, HlmTableImports, StatTile],
  providers: [MissionsViewModel, provideIcons({ lucideCrosshair })],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
