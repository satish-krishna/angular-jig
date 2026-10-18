import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export const hlmSmall = 'text-sm font-medium leading-none';

export type HlmSmallVariant = 'default' | 'relaxed' | 'link';

@Directive({
  selector: '[hlmSmall]',
})
export class HlmSmall {
  /**
   * 'relaxed' keeps the default line height for text that sits in a stack of lines.
   * 'link' is an inline text link: primary color, underlined on hover.
   */
  readonly variant = input<HlmSmallVariant>('default');

  constructor() {
    classes(() => {
      switch (this.variant()) {
        case 'relaxed':
          return 'text-sm font-medium';
        case 'link':
          return 'text-sm text-primary hover:underline';
        default:
          return hlmSmall;
      }
    });
  }
}
