import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldAlert } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { ThreatsViewModel } from './threats.view-model';

// The threats screen: every known threat, highest tier first. All state lives in ThreatsViewModel.
@Component({
  selector: 'app-threats',
  imports: [NgIcon, HlmBadgeImports, HlmCardImports, HlmIconImports, HlmTypographyImports],
  providers: [ThreatsViewModel, provideIcons({ lucideShieldAlert })],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
