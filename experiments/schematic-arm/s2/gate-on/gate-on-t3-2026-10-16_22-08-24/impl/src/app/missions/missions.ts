import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  imports: [RouterLink, HlmBadge, HlmCardImports, HlmTableImports, StatTile],
  providers: [MissionsViewModel],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
