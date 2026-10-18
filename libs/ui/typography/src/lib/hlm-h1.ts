import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export const hlmH1 = 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl';

export type HlmH1Variant = 'default' | 'page';

@Directive({
  selector: '[hlmH1]',
})
export class HlmH1 {
  /** 'page' is the screen title: smaller and bold instead of the display treatment. */
  readonly variant = input<HlmH1Variant>('default');

  constructor() {
    classes(() => (this.variant() === 'page' ? 'text-3xl font-bold' : hlmH1));
  }
}
