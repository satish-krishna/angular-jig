import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HeroCard } from '../ui/hero-card';
import { RosterViewModel } from './roster.view-model';

@Component({
  selector: 'app-roster',
  providers: [RosterViewModel],
  imports: [RouterLink, NgIcon, HlmTableImports, HlmInputImports, HlmButtonImports, HlmBadgeImports, HlmLabelImports, HlmDialogImports, HeroCard],
  templateUrl: './roster.html',
})
export class Roster {
  protected readonly vm = inject(RosterViewModel);
}
