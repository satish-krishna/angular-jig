import { Component, computed, input } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

// A presentational meter for a 0 to 100 power index. Inputs only, no data service.
@Component({
  selector: 'app-power-meter',
  imports: [HlmTypographyImports],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input('Power index');

  protected readonly percent = computed(() => Math.min(100, Math.max(0, this.value())));
}
