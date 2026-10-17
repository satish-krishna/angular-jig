import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideUserPlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { RosterTable } from '../ui/roster-table';
import { HeroesViewModel } from './heroes.view-model';

// The roster screen: a filter bar, the roster table, and a summary footer. All state lives in HeroesViewModel.
@Component({
  selector: 'app-heroes',
  imports: [
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmTypographyImports,
    RosterTable,
  ],
  providers: [HeroesViewModel, provideIcons({ lucideSearch, lucideUserPlus })],
  templateUrl: './heroes.html',
  styleUrl: './heroes.css',
})
export class Heroes {
  protected readonly vm = inject(HeroesViewModel);
}
