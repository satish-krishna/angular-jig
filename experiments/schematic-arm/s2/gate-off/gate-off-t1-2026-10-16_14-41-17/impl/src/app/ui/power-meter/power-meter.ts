import { Component, input } from '@angular/core';

/** A horizontal power bar over the 0 to 100 power index. Presentational: no data access. */
@Component({
  selector: 'app-power-meter',
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  /** 0 to 100 */
  readonly value = input.required<number>();
  /** The accessible name, for example "Power index of Silverwing". */
  readonly label = input.required<string>();
}
