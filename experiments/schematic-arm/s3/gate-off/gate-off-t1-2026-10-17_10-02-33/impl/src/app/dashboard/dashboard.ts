import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus, lucideUsers } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HeroCard } from '../ui/hero-card';
import { RosterTable } from '../ui/roster-table';
import { StatTile } from '../ui/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmIconImports,
    HlmTypographyImports,
    HeroCard,
    RosterTable,
    StatTile,
  ],
  providers: [DashboardViewModel, provideIcons({ lucideUserPlus, lucideUsers })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
