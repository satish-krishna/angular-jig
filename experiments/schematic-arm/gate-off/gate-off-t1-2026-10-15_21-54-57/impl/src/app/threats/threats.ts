import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldAlert } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  imports: [NgIcon, HlmBadgeImports, HlmCardImports],
  providers: [ThreatsViewModel, provideIcons({ lucideShieldAlert })],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex min-w-0 flex-col gap-1">
          <h1 class="text-2xl font-semibold">Threat board</h1>
          <p class="text-sm text-muted-foreground">Example data. Threat figures are illustrative.</p>
        </div>
        <span hlmBadge variant="destructive" class="gap-1" aria-live="polite">
          <ng-icon name="lucideShieldAlert" aria-hidden="true" />
          {{ vm.openCount() }} open of {{ vm.total() }}
        </span>
      </header>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (threat of vm.rows(); track threat.id) {
          <article hlmCard class="h-full">
            <div hlmCardHeader class="flex flex-col gap-2">
              <div class="flex flex-wrap gap-2">
                <span hlmBadge variant="secondary">Tier {{ threat.tier }}</span>
                <span hlmBadge [variant]="threat.statusVariant">{{ threat.status }}</span>
              </div>
              <h2 hlmCardTitle>{{ threat.name }}</h2>
              <p hlmCardDescription>{{ threat.location }}</p>
            </div>
            <div hlmCardContent>
              <p class="text-sm">{{ threat.summary }}</p>
            </div>
            <div hlmCardFooter>
              <p class="text-xs text-muted-foreground">{{ threat.id }}</p>
            </div>
          </article>
        } @empty {
          <p class="text-sm text-muted-foreground">No threats on file.</p>
        }
      </div>
    </div>
  `,
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
