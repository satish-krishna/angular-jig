import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMapPin, lucideShieldAlert, lucideTriangleAlert } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmH1, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  imports: [NgIcon, HlmIcon, HlmBadge, HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle, HlmH1, HlmMuted, HlmSmall, StatTile],
  providers: [ThreatsViewModel, provideIcons({ lucideMapPin, lucideShieldAlert, lucideTriangleAlert })],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
