import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideMoon, lucideSearch, lucideSun } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSidebarTrigger } from '@spartan-ng/helm/sidebar';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { HlmSmall } from '@spartan-ng/helm/typography';

// Presentational: state comes in through inputs and actions go out through outputs.
// It injects nothing.
@Component({
  selector: 'app-top-bar',
  imports: [
    NgIcon,
    HlmIconImports,
    HlmAvatarImports,
    HlmButton,
    HlmInput,
    HlmSidebarTrigger,
    HlmSmall,
    HlmTooltip,
  ],
  providers: [provideIcons({ lucideBell, lucideMoon, lucideSearch, lucideSun })],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  readonly crumbs = input.required<readonly string[]>();
  readonly dark = input.required<boolean>();
  readonly themeToggle = output<void>();
}
