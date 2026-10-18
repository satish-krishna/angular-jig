import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export const hlmSmall = 'text-sm font-medium leading-none';

export type HlmSmallVariant = 'default' | 'relaxed' | 'xs' | 'link';

const smallVariants: Record<HlmSmallVariant, string> = {
  default: hlmSmall,
  // Same size and weight, but the normal line height, for text in a stack of lines.
  relaxed: 'text-sm font-medium',
  // One size step down (text-xs) at regular weight; the color is inherited.
  xs: 'text-xs',
  // Primary-colored text that underlines on hover.
  link: 'text-sm text-primary hover:underline',
};

@Directive({
  selector: '[hlmSmall]',
})
export class HlmSmall {
  readonly variant = input<HlmSmallVariant>('default');

  constructor() {
    classes(() => smallVariants[this.variant()]);
  }
}
