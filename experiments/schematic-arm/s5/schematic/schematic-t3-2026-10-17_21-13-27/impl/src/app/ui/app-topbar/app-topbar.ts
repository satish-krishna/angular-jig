import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideChevronRight, lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSidebarTrigger } from '@spartan-ng/helm/sidebar';
import { HlmSmall } from '@spartan-ng/helm/typography';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import type { Crumb } from '../../shell/nav';

@Component({
  selector: 'app-topbar',
  imports: [
    RouterLink,
    NgIcon,
    HlmAvatar,
    HlmAvatarFallback,
    HlmButton,
    HlmInput,
    HlmSidebarTrigger,
    HlmSmall,
    HlmTooltip,
  ],
  providers: [provideIcons({ lucideBell, lucideChevronRight, lucideMoon, lucideSun })],
  templateUrl: './app-topbar.html',
  styleUrl: './app-topbar.css',
})
export class AppTopbar {
  public readonly crumbs = input.required<readonly Crumb[]>();
  public readonly dark = input.required<boolean>();
  public readonly toggleTheme = output<void>();
  public readonly search = output<string>();
}
