import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export const hlmLarge = 'text-lg font-semibold';

export type HlmLargeVariant = 'default' | 'numeric';

@Directive({
  selector: '[hlmLarge]',
})
export class HlmLarge {
  /**
   * 'numeric' is the headline-number treatment for stat values: text-3xl, bold, tight leading. It is
   * deliberately larger than hlmH3 despite the directive's name, and it is the same at every size:
   * unlike the card title it replaced, it does not shrink inside a size="sm" card.
   */
  readonly variant = input<HlmLargeVariant>('default');

  constructor() {
    classes(() => (this.variant() === 'numeric' ? 'text-3xl leading-tight font-bold' : hlmLarge));
  }
}
