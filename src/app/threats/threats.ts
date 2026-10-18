import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmH1, HlmMuted } from '@spartan-ng/helm/typography';
import { ThreatForm } from '../ui/threat-form/threat-form';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  providers: [ThreatsViewModel],
  imports: [
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmIconImports,
    HlmInputImports,
    HlmLabelImports,
    HlmTableImports,
    HlmH1,
    HlmMuted,
    ThreatForm,
  ],
  templateUrl: './threats.html',
  styleUrl: './threats.css',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
