import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideUserPlus } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmH1, HlmH3 } from '@spartan-ng/helm/typography';
import type { Hero } from '../hero/hero.model';
import { HeroCard } from '../ui/hero-card/hero-card';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    NgIcon,
    HlmIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    HlmH1,
    HlmH3,
    HeroCard,
    StatTile,
  ],
  providers: [DashboardViewModel, provideIcons({ lucideArrowRight, lucideUserPlus })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
  private readonly router = inject(Router);

  protected openHero(hero: Hero): void {
    void this.router.navigate(['/detail', hero.id]);
  }
}
