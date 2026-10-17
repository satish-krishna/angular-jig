import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCheck, lucideTarget, lucideTriangleAlert } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { MissionsViewModel } from './missions.view-model';

// The missions screen: outcome tiles over the mission log. Deployments launched from a hero's detail land here.
@Component({
  selector: 'app-missions',
  imports: [
    RouterLink,
    NgIcon,
    HlmBadgeImports,
    HlmCardImports,
    HlmIconImports,
    HlmTableImports,
    HlmTypographyImports,
    StatTile,
  ],
  providers: [
    MissionsViewModel,
    provideIcons({ lucideActivity, lucideCheck, lucideTarget, lucideTriangleAlert }),
  ],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
