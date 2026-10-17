import { Component, input } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

// Presentational: a 0 to 100 power index as a labelled native meter.
@Component({
  selector: 'app-power-meter',
  imports: [HlmTypographyImports],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
}
