import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucidePencil,
  lucidePlus,
  lucideTriangleAlert,
  lucideUserCheck,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HeroCard } from '../ui/hero-card';
import { StatTile } from '../ui/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [
    DecimalPipe,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmBadgeImports,
    HlmTableImports,
    StatTile,
    HeroCard,
  ],
  providers: [
    DashboardViewModel,
    provideIcons({
      lucideActivity,
      lucidePencil,
      lucidePlus,
      lucideTriangleAlert,
      lucideUserCheck,
      lucideZap,
    }),
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
