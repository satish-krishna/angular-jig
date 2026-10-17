import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCrosshair } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { StatTile } from '../ui/stat-tile';
import { MissionsViewModel } from './missions.view-model';

// Mission control: launch a deployment, then record how each live one ends.
@Component({
  selector: 'app-missions',
  imports: [
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmIconImports,
    HlmSelectImports,
    HlmTableImports,
    HlmTypographyImports,
    StatTile,
  ],
  providers: [MissionsViewModel, provideIcons({ lucideCrosshair })],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
