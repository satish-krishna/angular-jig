import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HeroCard } from '../ui/hero-card';
import { RosterViewModel } from './roster.view-model';
import type { HeroStatus } from '../hero/hero.model';

@Component({
  selector: 'app-roster',
  providers: [RosterViewModel],
  imports: [RouterLink, NgIcon, HlmTableImports, HlmInputImports, HlmButtonImports, HlmBadgeImports, HeroCard],
  templateUrl: './roster.html',
})
export class Roster {
  protected readonly vm = inject(RosterViewModel);

  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.vm.statusFilter.set(value as HeroStatus | 'all');
  }
}
