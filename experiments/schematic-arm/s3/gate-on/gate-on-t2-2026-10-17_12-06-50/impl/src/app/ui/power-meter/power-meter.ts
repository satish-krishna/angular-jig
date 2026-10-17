import { Component, input } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

// A hero's power index (0 to 100) as a native meter with its value printed beside it.
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
