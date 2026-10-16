import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ThreatsViewModel } from './threats.view-model';

/** The threat register: read-only, most severe first. Missions are planned on the Missions screen. */
@Component({
  selector: 'app-threats',
  imports: [RouterLink, HlmBadgeImports, HlmButtonImports, HlmTableImports],
  providers: [ThreatsViewModel],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
