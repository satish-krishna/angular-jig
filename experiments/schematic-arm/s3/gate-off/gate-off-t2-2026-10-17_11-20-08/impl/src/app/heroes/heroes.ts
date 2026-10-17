import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideSearch, lucideUserPlus } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HeroesViewModel } from './heroes.view-model';

// The roster screen: filter bar, sortable-by-power table, and summary footer.
@Component({
  selector: 'app-heroes',
  imports: [
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmIconImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmTableImports,
    HlmTypographyImports,
  ],
  providers: [HeroesViewModel, provideIcons({ lucidePencil, lucideSearch, lucideUserPlus })],
  templateUrl: './heroes.html',
  styleUrl: './heroes.css',
})
export class Heroes {
  protected readonly vm = inject(HeroesViewModel);
}
