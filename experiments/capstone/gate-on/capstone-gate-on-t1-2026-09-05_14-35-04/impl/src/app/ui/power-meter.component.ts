import { Component, input } from '@angular/core';

@Component({
  selector: 'app-power-meter',
  template: `
    <div class="flex items-center gap-2">
      <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          class="h-full bg-primary"
          [style.width.%]="power()"
        ></div>
      </div>
      <span class="text-xs font-semibold text-foreground w-8 text-right">{{ power() }}</span>
    </div>
  `,
})
export class PowerMeter {
  readonly power = input<number>(0);
}
