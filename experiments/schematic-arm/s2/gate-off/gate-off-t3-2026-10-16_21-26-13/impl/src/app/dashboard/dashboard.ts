import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideUserCheck, lucideUserPlus, lucideZap } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HeroCard } from '../ui/hero-card/hero-card';
import { RosterTable } from '../ui/roster-table/roster-table';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgIcon, HlmBadgeImports, HlmButtonImports, HlmCardImports, HeroCard, RosterTable, StatTile],
  providers: [
    DashboardViewModel,
    provideIcons({ lucideActivity, lucideShieldAlert, lucideUserCheck, lucideUserPlus, lucideZap }),
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
