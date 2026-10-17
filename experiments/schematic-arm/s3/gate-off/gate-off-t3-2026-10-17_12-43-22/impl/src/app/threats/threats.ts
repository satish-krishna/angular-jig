import { Component, inject } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HeroCard } from '../ui/hero-card/hero-card';
import { ThreatsViewModel } from './threats.view-model';

// Threats: the heroes who are out of action, and the live missions ranked by threat tier.
@Component({
  selector: 'app-threats',
  imports: [HlmBadgeImports, HlmTableImports, HlmTypographyImports, HeroCard],
  providers: [ThreatsViewModel],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
