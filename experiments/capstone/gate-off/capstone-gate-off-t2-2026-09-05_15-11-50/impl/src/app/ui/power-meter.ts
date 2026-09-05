import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-power-meter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <div class="flex-1">
        <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            class="h-full bg-primary rounded-full transition-all"
            [style.width.%]="value()"
          ></div>
        </div>
      </div>
      <span class="text-sm font-medium text-foreground min-w-8 text-right">{{ value() }}</span>
    </div>
  `,
})
export class PowerMeter {
  value = input.required<number>();
}
