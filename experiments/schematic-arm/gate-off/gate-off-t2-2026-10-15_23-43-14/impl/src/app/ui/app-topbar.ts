import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideMoon, lucideSearch, lucideSun } from '@ng-icons/lucide';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSidebarTrigger } from '@spartan-ng/helm/sidebar';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import type { Theme } from '../shell/theme.service';

/**
 * Top bar of the application shell: menu (mobile drawer), breadcrumb, search, and the
 * notification, theme and account controls. Presentational: state comes in as inputs and
 * actions go out as outputs.
 */
@Component({
  selector: 'app-topbar',
  imports: [NgIcon, HlmAvatar, HlmAvatarFallback, HlmButton, HlmInput, HlmSidebarTrigger, HlmTooltip],
  providers: [provideIcons({ lucideBell, lucideMoon, lucideSearch, lucideSun })],
  host: { class: 'block' },
  template: `
    <header class="flex flex-wrap items-center gap-2 border-b border-border bg-background px-4 py-3 md:px-6">
      <button hlmSidebarTrigger srOnlyText="Toggle navigation"></button>

      <nav aria-label="Breadcrumb" class="min-w-0 flex-1">
        <ol class="flex min-w-0 items-center gap-2 text-sm">
          <li class="truncate text-muted-foreground">Hero Ops</li>
          <li aria-hidden="true" class="text-muted-foreground">/</li>
          <li aria-current="page" class="truncate font-medium text-foreground">{{ crumb() }}</li>
        </ol>
      </nav>

      <div class="flex w-full min-w-0 items-center gap-2 sm:w-auto">
        <form
          role="search"
          class="flex min-w-0 flex-1 items-center gap-2 text-muted-foreground sm:w-64 sm:flex-none"
          (submit)="$event.preventDefault(); submitSearch.emit(query.value)"
        >
          <ng-icon name="lucideSearch" aria-hidden="true" />
          <input
            #query
            hlmInput
            type="search"
            class="w-full"
            placeholder="Search heroes"
            aria-label="Search heroes"
          />
        </form>

        <button
          hlmBtn
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          [hlmTooltip]="'Notifications'"
        >
          <ng-icon name="lucideBell" />
        </button>

        <button
          hlmBtn
          variant="ghost"
          size="icon"
          [attr.aria-label]="themeLabel()"
          [hlmTooltip]="themeLabel()"
          (click)="themeToggle.emit()"
        >
          <ng-icon [name]="theme() === 'dark' ? 'lucideSun' : 'lucideMoon'" />
        </button>

        <hlm-avatar size="sm">
          <span hlmAvatarFallback>OP</span>
        </hlm-avatar>
      </div>
    </header>
  `,
})
export class AppTopbar {
  public readonly crumb = input<string>('');
  public readonly theme = input<Theme>('light');
  public readonly themeToggle = output<void>();
  /** The search text as submitted. The shell decides where a search goes. */
  public readonly submitSearch = output<string>();

  protected readonly themeLabel = computed(() =>
    this.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
}
