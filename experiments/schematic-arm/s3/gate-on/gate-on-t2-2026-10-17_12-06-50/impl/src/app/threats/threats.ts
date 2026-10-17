import { Component, inject } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { ThreatsViewModel } from './threats.view-model';

// The threat board: one card per threat, most severe first, with the deployments answering it.
@Component({
  selector: 'app-threats',
  imports: [HlmBadgeImports, HlmCardImports, HlmTypographyImports],
  providers: [ThreatsViewModel],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
