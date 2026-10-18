import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export type HlmSkeletonVariant = 'default' | 'track' | 'bar';

@Directive({
  selector: '[hlmSkeleton],hlm-skeleton',
  host: {
    'data-slot': 'skeleton',
  },
})
export class HlmSkeleton {
  /**
   * 'track' and 'bar' are the two parts of a static meter: a muted pill track and the primary
   * fill inside it. Size the bar with a layout binding such as `[style.width.%]`.
   */
  readonly variant = input<HlmSkeletonVariant>('default');

  constructor() {
    classes(() =>
      this.variant() === 'track'
        ? 'block h-2 w-full overflow-hidden rounded-full bg-muted'
        : this.variant() === 'bar'
          ? 'block h-full rounded-full bg-primary'
          : 'bg-muted rounded-md block motion-safe:animate-pulse',
    );
  }
}
