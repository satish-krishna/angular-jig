import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
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
import { MissionForm } from '../ui/mission-form/mission-form';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  providers: [MissionsViewModel],
  imports: [
    DatePipe,
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
    MissionForm,
  ],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
