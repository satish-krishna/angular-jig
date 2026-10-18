import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export const hlmMuted = 'text-sm text-muted-foreground';

export type HlmMutedVariant = 'default' | 'sidebar';

@Directive({
  selector: '[hlmMuted]',
})
export class HlmMuted {
  /** 'sidebar' is a caption on the dark sidebar surface: extra small, in the sidebar's muted color. */
  readonly variant = input<HlmMutedVariant>('default');

  constructor() {
    classes(() => (this.variant() === 'sidebar' ? 'text-xs text-sidebar-muted' : hlmMuted));
  }
}
