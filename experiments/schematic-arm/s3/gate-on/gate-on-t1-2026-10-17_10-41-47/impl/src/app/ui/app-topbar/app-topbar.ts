import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideChevronRight, lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSidebarTrigger } from '@spartan-ng/helm/sidebar';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

// Presentational: state comes in through inputs, actions go out through outputs. No services.
@Component({
  selector: 'app-topbar',
  imports: [
    NgIcon,
    HlmIcon,
    HlmButton,
    HlmInput,
    HlmSidebarTrigger,
    HlmTooltip,
    HlmAvatarImports,
    HlmTypographyImports,
  ],
  providers: [provideIcons({ lucideBell, lucideChevronRight, lucideMoon, lucideSun })],
  templateUrl: './app-topbar.html',
  styleUrl: './app-topbar.css',
})
export class AppTopbar {
  readonly crumbs = input.required<readonly string[]>();
  readonly isDark = input.required<boolean>();
  readonly themeToggle = output<void>();
  /** The search text when the user submits it (Enter, or clearing the box). */
  readonly searched = output<string>();

  protected readonly themeLabel = computed(() =>
    this.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );
}
