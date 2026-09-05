import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { Hero } from '../domain/hero.model';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [CommonModule, NgIconsModule, HlmAvatarImports],
  template: `
    <div class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex gap-3 mb-3">
        <hlm-avatar class="flex-shrink-0">
          <span hlmAvatarFallback>{{ hero().name.substring(0, 2).toUpperCase() }}</span>
        </hlm-avatar>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-foreground truncate">{{ hero().name }}</h3>
          <p class="text-xs text-muted-foreground">{{ hero().alias }}</p>
        </div>
      </div>

      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Power</span>
          <span class="font-medium">{{ hero().powerIndex }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Missions</span>
          <span class="font-medium">{{ hero().missionCount }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Success Rate</span>
          <span class="font-medium">{{ hero().successRate }}%</span>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-border">
        <div class="flex items-center gap-2">
          <span class="inline-block px-2 py-1 bg-muted rounded text-xs font-medium text-foreground">
            {{ hero().powerClass }}
          </span>
          <span class="inline-block px-2 py-1 rounded text-xs font-medium"
            [class.bg-green-100]="hero().status === 'Active'"
            [class.text-green-800]="hero().status === 'Active'"
            [class.bg-yellow-100]="hero().status === 'Injured'"
            [class.text-yellow-800]="hero().status === 'Injured'"
            [class.bg-gray-100]="hero().status === 'Reserve'"
            [class.text-gray-800]="hero().status === 'Reserve'"
            [class.bg-red-100]="hero().status === 'MIA'"
            [class.text-red-800]="hero().status === 'MIA'"
            [class.dark:bg-green-900]="hero().status === 'Active'"
            [class.dark:text-green-200]="hero().status === 'Active'"
            [class.dark:bg-yellow-900]="hero().status === 'Injured'"
            [class.dark:text-yellow-200]="hero().status === 'Injured'"
            [class.dark:bg-gray-900]="hero().status === 'Reserve'"
            [class.dark:text-gray-200]="hero().status === 'Reserve'"
            [class.dark:bg-red-900]="hero().status === 'MIA'"
            [class.dark:text-red-200]="hero().status === 'MIA'">
            @if (hero().status === 'Active') {
              Active
            } @else if (hero().status === 'Injured') {
              Injured
            } @else if (hero().status === 'Reserve') {
              Reserve
            } @else if (hero().status === 'MIA') {
              MIA
            }
          </span>
        </div>
      </div>
    </div>
  `,
})
export class HeroCard {
  hero = input.required<Hero>();
}
