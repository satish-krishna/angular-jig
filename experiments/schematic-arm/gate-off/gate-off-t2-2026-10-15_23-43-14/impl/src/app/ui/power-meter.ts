import { Component, computed, input } from '@angular/core';

/**
 * A 0-100 value drawn as a horizontal meter. Presentational: takes the value and its label as
 * inputs and exposes it to assistive technology as a meter. Used for power index and success rate.
 */
@Component({
  selector: 'app-power-meter',
  host: { class: 'block' },
  template: `
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>{{ label() }}</span>
        <span class="font-medium text-foreground">{{ value() }}</span>
      </div>
      <div
        role="meter"
        [attr.aria-label]="label()"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-valuenow]="value()"
        class="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div class="h-full rounded-full bg-primary" [style.width.%]="fill()"></div>
      </div>
    </div>
  `,
})
export class PowerMeter {
  public readonly value = input.required<number>();
  public readonly label = input('Power index');

  protected readonly fill = computed(() => Math.min(100, Math.max(0, this.value())));
}
