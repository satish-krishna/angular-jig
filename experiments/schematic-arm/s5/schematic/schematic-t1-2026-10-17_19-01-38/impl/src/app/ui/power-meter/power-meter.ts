import { Component, computed, input } from '@angular/core';
import { HlmSmall } from '@spartan-ng/helm/typography';

// Presentational: a 0 to 100 power index as a labelled meter. Takes its value as an input and injects nothing.
@Component({
  selector: 'app-power-meter',
  imports: [HlmSmall],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly value = input.required<number>();
  readonly label = input('Power index');

  protected readonly fill = computed(() => Math.min(100, Math.max(0, this.value())));
}
