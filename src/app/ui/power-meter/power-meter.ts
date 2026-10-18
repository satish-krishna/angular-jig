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

  // brn-progress throws when the value leaves 0..max, so clamp before binding.
  protected readonly clamped = computed(() => Math.min(this.max(), Math.max(0, this.value())));
}
