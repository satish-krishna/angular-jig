import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export const hlmLarge = 'text-lg font-semibold';

export type HlmLargeVariant = 'default' | 'brand';

@Directive({
  selector: '[hlmLarge]',
})
export class HlmLarge {
  /** 'brand' is the wordmark: bold instead of semibold. */
  readonly variant = input<HlmLargeVariant>('default');

  constructor() {
    classes(() => (this.variant() === 'brand' ? 'text-lg font-bold' : hlmLarge));
  }
}
