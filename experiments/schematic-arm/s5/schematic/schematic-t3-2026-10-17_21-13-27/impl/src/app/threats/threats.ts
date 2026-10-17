import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideShield, lucideShieldAlert } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmH1, HlmMuted } from '@spartan-ng/helm/typography';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  imports: [
    NgIcon,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmIconImports,
    HlmH1,
    HlmMuted,
  ],
  providers: [
    ThreatsViewModel,
    provideIcons({ lucideCircleCheck, lucideShield, lucideShieldAlert }),
  ],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
