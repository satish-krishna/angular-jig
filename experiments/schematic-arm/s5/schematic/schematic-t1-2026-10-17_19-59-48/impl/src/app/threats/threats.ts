import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldAlert, lucideTriangleAlert, lucideUserCheck } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmH1, HlmH2, HlmH3, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  imports: [
    RouterLink,
    NgIcon,
    HlmBadgeImports,
    HlmCardImports,
    HlmIconImports,
    HlmH1,
    HlmH2,
    HlmH3,
    HlmMuted,
    HlmSmall,
    StatTile,
  ],
  providers: [
    ThreatsViewModel,
    provideIcons({ lucideShieldAlert, lucideTriangleAlert, lucideUserCheck }),
  ],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
