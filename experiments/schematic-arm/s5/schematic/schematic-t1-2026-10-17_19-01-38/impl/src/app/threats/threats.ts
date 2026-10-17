import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldAlert } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmH3, HlmH4, HlmMuted } from '@spartan-ng/helm/typography';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  imports: [NgIcon, HlmIcon, HlmBadgeImports, HlmButtonImports, HlmCardImports, HlmH3, HlmH4, HlmMuted],
  providers: [ThreatsViewModel, provideIcons({ lucideShieldAlert })],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
