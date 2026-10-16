import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRadar, lucideShieldAlert, lucideTriangleAlert } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { StatTile } from '../ui/stat-tile';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  imports: [NgIcon, HlmBadgeImports, HlmCardImports, StatTile],
  providers: [
    ThreatsViewModel,
    provideIcons({ lucideRadar, lucideShieldAlert, lucideTriangleAlert }),
  ],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
