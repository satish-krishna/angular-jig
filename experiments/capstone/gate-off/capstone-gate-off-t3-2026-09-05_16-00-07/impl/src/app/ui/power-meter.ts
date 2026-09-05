import { Component, input } from '@angular/core';

@Component({
  selector: 'app-power-meter',
  imports: [],
  template: `
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-foreground">{{ label() }}</span>
        <span class="text-sm font-bold text-primary">{{ value() }}%</span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          class="h-full bg-primary transition-all duration-300"
          [style.width.%]="value()"
        ></div>
      </div>
    </div>
  `,
})
export class PowerMeter {
  label = input<string>('Power');
  value = input.required<number>();
}
