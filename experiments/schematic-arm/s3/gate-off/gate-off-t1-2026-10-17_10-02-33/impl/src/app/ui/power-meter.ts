import { Component, input } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

// Presentational: a 0-100 power index drawn with the native meter, so the bar carries its own
// role and value to assistive technology without any colour set in the app stylesheet.
@Component({
  selector: 'app-power-meter',
  imports: [HlmTypographyImports],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
}
