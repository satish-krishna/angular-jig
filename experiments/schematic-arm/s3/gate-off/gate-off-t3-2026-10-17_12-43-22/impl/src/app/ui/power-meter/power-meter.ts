import { Component, input } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

// Presentational: a 0 to 100 power index drawn as a native meter, so the browser
// supplies the role and value to assistive tech. No progress primitive is installed.
@Component({
  selector: 'app-power-meter',
  imports: [HlmTypographyImports],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  public readonly value = input.required<number>();
}
