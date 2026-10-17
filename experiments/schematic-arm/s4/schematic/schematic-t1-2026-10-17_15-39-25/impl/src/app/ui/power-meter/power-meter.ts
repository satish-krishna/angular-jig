import { Component, computed, input } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

// Presentational: a 0-100 power index. Clamps out-of-range input so a bad record cannot misreport.
@Component({
  selector: 'app-power-meter',
  imports: [HlmTypographyImports],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input('Power index');
  protected readonly clamped = computed(() => Math.min(100, Math.max(0, Math.round(this.value()))));
}
