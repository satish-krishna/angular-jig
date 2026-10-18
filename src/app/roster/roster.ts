import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmH1, HlmMuted } from '@spartan-ng/helm/typography';
import { HeroCard } from '../ui/hero-card/hero-card';
import { RosterViewModel } from './roster.view-model';

@Component({
  selector: 'app-roster',
  providers: [RosterViewModel],
  imports: [RouterLink, NgIcon, HlmTableImports, HlmInputImports, HlmButtonImports, HlmBadgeImports, HlmLabelImports, HlmDialogImports, HlmIconImports, HlmH1, HlmMuted, HeroCard],
  templateUrl: './roster.html',
  styleUrl: './roster.css',
})
export class Roster {
  protected readonly vm = inject(RosterViewModel);
}
