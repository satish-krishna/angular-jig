import { Component, input } from '@angular/core';

/** A 0-100 power index drawn as a bar. Presentational: the caller supplies the value and its name. */
@Component({
  selector: 'app-power-meter',
  host: {
    class: 'block',
  },
  template: `
    <div
      role="meter"
      class="h-2 w-full overflow-hidden rounded-full bg-muted"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="value()"
      [attr.aria-label]="label()"
    >
      <div class="h-full rounded-full bg-primary" [style.width.%]="value()"></div>
    </div>
  `,
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
}
