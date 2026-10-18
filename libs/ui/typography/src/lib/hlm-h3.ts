import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export const hlmH3 = 'scroll-m-20 text-2xl font-semibold tracking-tight';

export type HlmH3Variant = 'default' | 'section';

@Directive({
  selector: '[hlmH3]',
})
export class HlmH3 {
  /** 'section' is a screen section title: one step down from the default, no tracking. */
  readonly variant = input<HlmH3Variant>('default');

  constructor() {
    classes(() => (this.variant() === 'section' ? 'text-xl font-semibold' : hlmH3));
  }
}
