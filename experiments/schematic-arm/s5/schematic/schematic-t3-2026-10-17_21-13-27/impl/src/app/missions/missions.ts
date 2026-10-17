import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCircleX, lucideTarget } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmH1, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  imports: [
    NgIcon,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmIconImports,
    HlmH1,
    HlmMuted,
    HlmSmall,
  ],
  providers: [
    MissionsViewModel,
    provideIcons({ lucideCheck, lucideCircleX, lucideTarget }),
  ],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
