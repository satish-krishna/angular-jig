import { Component, input } from '@angular/core';

/** A horizontal bar for a 0 to 100 power index. Presentational: it only draws the value it is given. */
@Component({
  selector: 'app-power-meter',
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
}
