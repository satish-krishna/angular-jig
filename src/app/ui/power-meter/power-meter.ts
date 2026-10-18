import { Component, computed, input } from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';

@Component({
  selector: 'app-power-meter',
  imports: [HlmSkeletonImports, HlmMuted, HlmSmall],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly max = input(100);

  protected readonly percent = computed(() => {
    const max = this.max();
    return max > 0 ? Math.min(100, Math.max(0, (this.value() / max) * 100)) : 0;
  });
}
