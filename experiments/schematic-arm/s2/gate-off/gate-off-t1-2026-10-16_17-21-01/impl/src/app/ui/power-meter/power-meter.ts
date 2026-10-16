import { Component, computed, input } from '@angular/core';

// Presentational: a 0-100 meter with the ARIA meter role. No data service.
@Component({
  selector: 'app-power-meter',
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input.required<string>();

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, Math.round(this.value()))));
}
