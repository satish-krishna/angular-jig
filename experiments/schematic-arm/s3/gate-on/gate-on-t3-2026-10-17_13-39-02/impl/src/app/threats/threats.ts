import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldAlert, lucideTriangleAlert, lucideZap } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { ThreatsViewModel } from './threats.view-model';

// The threats screen: counts over the threat board, one card per active assessment.
@Component({
  selector: 'app-threats',
  imports: [NgIcon, HlmBadgeImports, HlmCardImports, HlmIconImports, HlmTypographyImports, StatTile],
  providers: [
    ThreatsViewModel,
    provideIcons({ lucideShieldAlert, lucideTriangleAlert, lucideZap }),
  ],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
