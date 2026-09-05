import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { DashboardViewModel } from './dashboard-view-model';
import { StatTile } from '../ui/stat-tile.component';
import { HeroCard } from '../ui/hero-card.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    HlmButtonImports,
    HlmBadgeImports,
    HlmTableImports,
    NgIconsModule,
    StatTile,
    HeroCard,
  ],
  providers: [
    DashboardViewModel,
    provideIcons({
      lucideUserPlus,
    }),
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
