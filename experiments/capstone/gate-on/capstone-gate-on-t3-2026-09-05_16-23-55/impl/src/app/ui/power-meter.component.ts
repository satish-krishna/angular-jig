import { Component, input } from '@angular/core';

@Component({
  selector: 'app-power-meter',
  standalone: true,
  template: `
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-foreground">{{ label() }}</span>
        <span class="text-sm font-bold text-primary">{{ value() }}</span>
      </div>
      <div class="h-2 bg-muted rounded-full overflow-hidden">
        <div class="h-full bg-primary" [style]="'width: ' + value() + '%'"></div>
      </div>
    </div>
  `,
})
export class PowerMeterComponent {
  readonly label = input('Power');
  readonly value = input.required<number>();
}
