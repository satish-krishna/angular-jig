import { Component, computed, input } from '@angular/core';

/** A 0 to 100 power index drawn as a bar. Presentational: the value and label arrive as inputs. */
@Component({
  selector: 'app-power-meter',
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly label = input.required<string>();
  readonly value = input.required<number>();

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, this.value())));
}
