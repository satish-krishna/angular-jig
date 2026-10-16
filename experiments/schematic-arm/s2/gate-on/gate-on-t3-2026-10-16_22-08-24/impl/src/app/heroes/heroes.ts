import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideUserPlus } from '@ng-icons/lucide';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HeroesViewModel } from './heroes.view-model';

@Component({
  selector: 'app-heroes',
  imports: [RouterLink, NgIcon, HlmAvatar, HlmAvatarFallback, HlmBadge, HlmButton, HlmInput, HlmLabel, HlmSelectImports, HlmTableImports],
  providers: [HeroesViewModel, provideIcons({ lucidePencil, lucideUserPlus })],
  templateUrl: './heroes.html',
  styleUrl: './heroes.css',
})
export class Heroes {
  protected readonly vm = inject(HeroesViewModel);
}
