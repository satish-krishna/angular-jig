import { Component, input } from '@angular/core';
import { HlmSmall } from '@spartan-ng/helm/typography';

// Presentational: a hero's power index on a 0-100 scale. The bar is the native <meter>,
// which is a read-only value display with its own role and no sealed primitive for it.
@Component({
  selector: 'app-power-meter',
  imports: [HlmSmall],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
}
