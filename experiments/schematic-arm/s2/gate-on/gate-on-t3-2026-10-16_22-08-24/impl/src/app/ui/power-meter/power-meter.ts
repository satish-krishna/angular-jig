import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-power-meter',
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  /** Power index, 0 to 100. Out-of-range values are clamped for the bar, not for the reading. */
  readonly value = input.required<number>();
  readonly label = input.required<string>();

  protected readonly percent = computed(() => Math.min(100, Math.max(0, this.value())));
}
