import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { StatTile } from '../ui/stat-tile';
import { HeroCard } from '../ui/hero-card';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  providers: [DashboardViewModel],
  imports: [NgIcon, StatTile, HeroCard],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
  private readonly router = inject(Router);

  goToHero(id: string) {
    this.router.navigate(['/detail', id]);
  }
}
