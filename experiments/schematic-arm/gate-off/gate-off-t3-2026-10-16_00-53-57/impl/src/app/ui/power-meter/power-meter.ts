import { Component, input } from '@angular/core';

/** Power index bar, 0 to 100. Presentational: takes its value as an input and injects nothing. */
@Component({
  selector: 'app-power-meter',
  template: `
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>Power</span>
        <span class="font-medium text-foreground tabular-nums">{{ value() }}</span>
      </div>
      <div
        role="meter"
        class="h-2 w-full overflow-hidden rounded-full bg-muted"
        [attr.aria-label]="label()"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-valuenow]="value()"
      >
        <div class="h-full rounded-full bg-primary" [style.width.%]="value()"></div>
      </div>
    </div>
  `,
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input<string>('Power index');
}
