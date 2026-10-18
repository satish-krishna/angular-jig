import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { HeroCard } from '../ui/hero-card/hero-card';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmH1, HlmH3, HlmSmall } from '@spartan-ng/helm/typography';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  providers: [DashboardViewModel],
  imports: [NgIcon, StatTile, HeroCard, HlmCardImports, HlmIconImports, HlmH1, HlmH3, HlmSmall],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
  private readonly router = inject(Router);

  goToHero(id: string) {
    this.router.navigate(['/detail', id]);
  }
}
