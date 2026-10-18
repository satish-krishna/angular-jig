import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export const hlmLarge = 'text-lg font-semibold';

export type HlmLargeVariant = 'default' | 'numeric';

@Directive({
  selector: '[hlmLarge]',
})
export class HlmLarge {
  /** 'numeric' is the headline-number treatment (large, bold, tight leading) for stat values. */
  readonly variant = input<HlmLargeVariant>('default');

  constructor() {
    classes(() => (this.variant() === 'numeric' ? 'text-3xl leading-tight font-bold' : hlmLarge));
  }
}
