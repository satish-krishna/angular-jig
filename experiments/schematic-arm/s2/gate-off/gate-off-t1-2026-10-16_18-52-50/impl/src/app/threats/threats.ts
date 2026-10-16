import { Component, inject } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ThreatsViewModel } from './threats.view-model';

/** The threats screen: the threat board, most severe open threats first, with a contain action. */
@Component({
  selector: 'app-threats',
  imports: [HlmBadgeImports, HlmButtonImports, HlmTableImports],
  providers: [ThreatsViewModel],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
