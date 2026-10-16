import { Component, computed, input } from '@angular/core';

/** A 0-100 power index drawn as a bar. Presentational: the value comes in, nothing is fetched. */
@Component({
  selector: 'app-power-meter',
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input('Power index');

  protected readonly percent = computed(() => Math.min(100, Math.max(0, this.value())));
}
