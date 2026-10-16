import { Component, inject } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  imports: [HlmBadge, HlmCardImports, StatTile],
  providers: [ThreatsViewModel],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
