import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-power-meter',
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  /** Power index, 0 to 100. */
  readonly value = input.required<number>();
  readonly label = input.required<string>();

  /** The fill width, clamped so an out-of-range value cannot overflow the track. */
  protected readonly fill = computed(() => Math.min(100, Math.max(0, this.value())));
}
