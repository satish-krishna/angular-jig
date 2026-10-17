import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HeroFields } from '../ui/hero-fields';
import { RecruitViewModel } from './recruit.view-model';

// The recruit screen: one form that enrols a new hero on the roster. All state lives in RecruitViewModel.
@Component({
  selector: 'app-recruit',
  imports: [RouterLink, HlmButtonImports, HlmCardImports, HlmTypographyImports, HeroFields],
  providers: [RecruitViewModel],
  templateUrl: './recruit.html',
  styleUrl: './recruit.css',
})
export class Recruit {
  protected readonly vm = inject(RecruitViewModel);
}
