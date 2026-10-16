import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCheck, lucideTarget } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { StatTile } from '../ui/stat-tile';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  imports: [
    RouterLink,
    NgIcon,
    HlmBadgeImports,
    HlmSelectImports,
    HlmTableImports,
    StatTile,
  ],
  providers: [
    MissionsViewModel,
    provideIcons({ lucideActivity, lucideCheck, lucideTarget }),
  ],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
