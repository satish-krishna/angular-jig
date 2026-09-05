import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  template: `
    <div class="flex flex-col gap-6 p-6">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Active Threats</h1>
        <span class="text-sm text-muted-foreground">{{ vm.threatenedHeroes().length }} heroes at risk</span>
      </div>

      <!-- Summary stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-card border border-border rounded-lg p-4">
          <div class="text-sm text-muted-foreground">Injured</div>
          <div class="text-2xl font-bold">{{ vm.injuredCount() }}</div>
        </div>
        <div class="bg-card border border-border rounded-lg p-4">
          <div class="text-sm text-muted-foreground">Reserved</div>
          <div class="text-2xl font-bold">{{ vm.reserveCount() }}</div>
        </div>
        <div class="bg-card border border-border rounded-lg p-4">
          <div class="text-sm text-muted-foreground">MIA</div>
          <div class="text-2xl font-bold text-destructive">{{ vm.miaCount() }}</div>
        </div>
      </div>

      <!-- Threats list -->
      <div class="flex flex-col gap-4">
        @if (vm.threatenedHeroes().length > 0) {
          @for (hero of vm.threatenedHeroes(); track hero.id) {
            <div class="bg-card border border-border rounded-lg p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-4 flex-1">
                  <div hlmAvatar>
                    {{ getInitials(hero.name) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold">{{ hero.name }}</h3>
                    <p class="text-sm text-muted-foreground">{{ hero.alias }}</p>
                    <div class="flex gap-2 mt-2">
                      <div hlmBadge [variant]="getStatusVariant(hero.status)">
                        {{ hero.status }}
                      </div>
                      <div hlmBadge variant="outline">{{ hero.powerClass }}</div>
                      <div hlmBadge variant="secondary">{{ hero.clearanceTier }}</div>
                    </div>
                  </div>
                </div>
                <a [routerLink]="['/detail', hero.id]" hlmBtn variant="ghost" size="sm">
                  <ng-icon name="lucidePencil" />
                  <span>View</span>
                </a>
              </div>
            </div>
          }
        } @else {
          <div class="bg-card border border-border rounded-lg p-8 text-center">
            <ng-icon name="lucideShieldAlert" class="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p class="text-muted-foreground">All heroes accounted for and healthy</p>
          </div>
        }
      </div>
    </div>
  `,
  standalone: true,
  imports: [RouterLink, NgIcon, HlmButton, HlmBadge, HlmAvatarImports],
  providers: [ThreatsViewModel],
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);

  getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase();
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'Injured':
        return 'secondary';
      case 'MIA':
        return 'destructive';
      case 'Reserve':
        return 'outline';
      default:
        return 'default';
    }
  }
}
