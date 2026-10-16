import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HeroCard } from '../ui/hero-card/hero-card';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgIcon, HlmBadge, HlmButton, HlmTableImports, StatTile, HeroCard],
  providers: [DashboardViewModel, provideIcons({ lucideUserPlus })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
