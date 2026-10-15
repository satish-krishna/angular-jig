import { Component, input } from '@angular/core';

/** A 0-100 power index shown as a labelled bar. Presentational: takes an input, injects nothing. */
@Component({
  selector: 'app-power-meter',
  template: `
    <div class="flex flex-col gap-1">
      <div class="flex items-baseline justify-between text-xs text-muted-foreground">
        <span>Power</span>
        <span class="font-medium text-foreground">{{ value() }}</span>
      </div>
      <div
        role="meter"
        aria-label="Power"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-valuenow]="value()"
        class="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div class="h-full rounded-full bg-primary" [style.width.%]="value()"></div>
      </div>
    </div>
  `,
})
export class PowerMeter {
  readonly value = input.required<number>();
}
