import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideTriangleAlert, lucideUserCheck, lucideUserPlus, lucideZap } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardContent } from '@spartan-ng/helm/card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmH1, HlmH2, HlmMuted } from '@spartan-ng/helm/typography';
import { HeroCard } from '../ui/hero-card/hero-card';
import { RosterTable } from '../ui/roster-table/roster-table';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgIcon, HlmIcon, HlmBadge, HlmButton, HlmCard, HlmCardContent, HlmH1, HlmH2, HlmMuted, HeroCard, RosterTable, StatTile],
  providers: [
    DashboardViewModel,
    provideIcons({ lucideActivity, lucideTriangleAlert, lucideUserCheck, lucideUserPlus, lucideZap }),
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
