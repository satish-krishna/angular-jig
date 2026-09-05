import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCard } from '@spartan-ng/helm/card';
import { NgIconsModule } from '@ng-icons/core';

export interface StatTileData {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

@Component({
  selector: 'app-stat-tile',
  standalone: true,
  imports: [CommonModule, HlmCard, NgIconsModule],
  template: `
    <hlm-card class="h-full">
      <div class="p-6 flex flex-col gap-3">
        <div class="flex items-start justify-between">
          <h3 class="text-sm font-medium text-muted-foreground">{{ data().label }}</h3>
          <ng-icon [name]="data().icon" class="w-5 h-5 text-muted-foreground" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-foreground">{{ data().value }}</span>
          @if (data().trend) {
            <span [class]="getTrendClass()">
              {{ data().trend!.value }}
            </span>
          }
        </div>
      </div>
    </hlm-card>
  `,
})
export class StatTileComponent {
  readonly data = input.required<StatTileData>();

  getTrendClass(): string {
    const trend = this.data().trend;
    if (!trend) return '';
    const baseClass = 'text-xs font-medium';
    if (trend.direction === 'up') return `${baseClass} text-success`;
    if (trend.direction === 'down') return `${baseClass} text-warning`;
    return `${baseClass} text-muted-foreground`;
  }
}
