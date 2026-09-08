import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-power-meter',
  template: `
    <div class="grid gap-1">
      <div class="flex items-baseline justify-between">
        <span class="text-sm text-muted-foreground">{{ label() }}</span>
        <span class="text-sm font-medium text-foreground">{{ value() }} / {{ max() }}</span>
      </div>
      <div
        class="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        [attr.aria-label]="label()"
        [attr.aria-valuenow]="value()"
        aria-valuemin="0"
        [attr.aria-valuemax]="max()"
      >
        <div class="h-full rounded-full bg-primary" [style.width.%]="percent()"></div>
      </div>
    </div>
  `,
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
