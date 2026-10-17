import { Component, input } from '@angular/core';
import { HlmSmall } from '@spartan-ng/helm/typography';

@Component({
  selector: 'app-power-meter',
  imports: [HlmSmall],
  templateUrl: './power-meter.html',
  styleUrl: './power-meter.css',
})
export class PowerMeter {
  public readonly value = input.required<number>();
  public readonly label = input.required<string>();
}
