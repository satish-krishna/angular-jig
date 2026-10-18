import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export const hlmH1 = 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl';

export type HlmH1Variant = 'default' | 'compact';

const h1Variants: Record<HlmH1Variant, string> = {
  default: hlmH1,
  // One size step down (text-3xl) and plain bold, with no display tracking.
  compact: 'text-3xl font-bold',
};

@Directive({
  selector: '[hlmH1]',
})
export class HlmH1 {
  readonly variant = input<HlmH1Variant>('default');

  constructor() {
    classes(() => h1Variants[this.variant()]);
  }
}
