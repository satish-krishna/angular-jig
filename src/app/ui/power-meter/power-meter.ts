import { Component, computed, input } from '@angular/core';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';

@Component({
  selector: 'app-power-meter',
  imports: [HlmProgressImports, HlmMuted, HlmSmall],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly max = input(100);

  // brn-progress throws when max is negative or the value leaves 0..max, so
  // floor the max at 0 and clamp the value before binding. A max of 0 or below
  // renders an empty bar.
  protected readonly safeMax = computed(() => Math.max(0, this.max()));
  protected readonly clamped = computed(() => Math.min(this.safeMax(), Math.max(0, this.value())));

  // Screen readers get the same "value / max" text the visible label shows, not
  // brn progress's automatic percentage.
  protected readonly valueLabel = () => `${this.value()} / ${this.max()}`;
}
