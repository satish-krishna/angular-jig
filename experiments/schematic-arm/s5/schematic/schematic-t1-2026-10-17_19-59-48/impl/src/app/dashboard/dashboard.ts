import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideUserCheck, lucideUserPlus, lucideZap } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmH1, HlmH2, HlmMuted } from '@spartan-ng/helm/typography';
import { HeroCard } from '../ui/hero-card/hero-card';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmIconImports,
    HlmH1,
    HlmH2,
    HlmMuted,
    HeroCard,
    StatTile,
  ],
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
