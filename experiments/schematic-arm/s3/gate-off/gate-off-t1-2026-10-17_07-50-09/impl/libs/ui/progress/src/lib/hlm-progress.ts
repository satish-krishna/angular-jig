import { Component, computed, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

/**
 * A determinate progress bar, exposed as an ARIA progressbar. `value` is clamped
 * to 0-100. `label` names the bar for assistive technology, so it must say what
 * is being measured.
 */
@Component({
  selector: 'hlm-progress',
  host: {
    'data-slot': 'progress',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'percent()',
    '[attr.aria-label]': 'label()',
  },
  template: `<span data-slot="progress-indicator" class="block h-full rounded-full bg-primary transition-[width]" [style.width.%]="percent()"></span>`,
})
export class HlmProgress {
  public readonly value = input.required<number>();
  public readonly label = input.required<string>();

  protected readonly percent = computed(() => Math.min(100, Math.max(0, this.value())));

  constructor() {
    classes(() => 'relative block h-2 w-full overflow-hidden rounded-full bg-muted');
  }
}
