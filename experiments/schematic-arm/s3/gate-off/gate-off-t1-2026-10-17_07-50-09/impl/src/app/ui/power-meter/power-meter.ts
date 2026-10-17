import { Component, input } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';

// Presentational: a power index readout. Injects nothing.
@Component({
  selector: 'app-power-meter',
  imports: [HlmBadge],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  /** Power index, 0-100. */
  readonly value = input.required<number>();
}
