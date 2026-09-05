import { Component, input } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-stat-tile',
  standalone: true,
  imports: [NgIconsModule],
  template: `
    <div class="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-muted-foreground">{{ label() }}</span>
        @if (icon()) {
          <ng-icon [name]="icon()" class="w-5 h-5 text-muted-foreground" />
        }
      </div>
      <div class="text-3xl font-bold text-foreground">{{ value() }}</div>
      @if (trend()) {
        <div class="text-xs mt-2" [class.text-green-600]="trend()! > 0" [class.text-red-600]="trend()! < 0">
          @if (trend()! > 0) {
            <span>↑</span>
          }
          @if (trend()! < 0) {
            <span>↓</span>
          }
          {{ Math.abs(trend()!) }}% from last cycle
        </div>
      }
    </div>
  `,
})
export class StatTile {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input<string>();
  trend = input<number>();
  Math = Math;
}
