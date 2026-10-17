import { Component, input } from '@angular/core';
import { HlmSmall } from '@spartan-ng/helm/typography';

// Presentational: the power index comes in as an input. No services.
@Component({
  selector: 'app-power-meter',
  imports: [HlmSmall],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  /** Power index, 0 to 100. */
  readonly value = input.required<number>();
}
