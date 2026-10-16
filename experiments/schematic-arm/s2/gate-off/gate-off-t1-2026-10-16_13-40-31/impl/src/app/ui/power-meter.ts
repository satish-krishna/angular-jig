import { Component, input } from '@angular/core';

/** A 0-100 power index drawn as a bar. Presentational: takes its value as an input. */
@Component({
  selector: 'app-power-meter',
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
}
