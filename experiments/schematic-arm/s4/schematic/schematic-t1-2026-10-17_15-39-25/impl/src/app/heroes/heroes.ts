import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { RosterTable } from '../ui/roster-table/roster-table';
import { HeroesViewModel } from './heroes.view-model';

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
  providers: [HeroesViewModel, provideIcons({ lucideUserPlus })],
  templateUrl: './heroes.html',
  styleUrl: './heroes.css',
})
export class Heroes {
  protected readonly vm = inject(HeroesViewModel);
}
