import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { MissionsViewModel } from './missions.view-model';

// The missions screen: every deployment, or only the ones for the hero named in the URL. All state lives in MissionsViewModel.
@Component({
  selector: 'app-missions',
  imports: [RouterLink, HlmBadgeImports, HlmButtonImports, HlmCardImports, HlmTypographyImports],
  providers: [MissionsViewModel],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
