import { Component, input } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

// Presentational: takes its value as an input and injects nothing.
@Component({
  selector: 'app-power-meter',
  imports: [HlmTypographyImports],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
}
