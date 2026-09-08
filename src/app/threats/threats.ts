import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ThreatForm } from '../ui/threat-form';
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
    HlmInputImports,
    HlmTableImports,
    ThreatForm,
  ],
  templateUrl: './threats.html',
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
