import { Directive, input } from '@angular/core';
import { BrnProgress } from '@spartan-ng/brain/progress';
import { classes } from '@spartan-ng/helm/utils';
import { cva, type VariantProps } from 'class-variance-authority';

export const progressVariants = cva('relative block h-2 w-full overflow-hidden rounded-full', {
  variants: {
    variant: {
      default: 'bg-primary/20',
      muted: 'bg-muted',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type ProgressVariants = VariantProps<typeof progressVariants>;

/**
 * Determinate values only. Brain reports a missing value as `indeterminate`, but the
 * indicator draws it as an empty bar and nothing animates it. Add that state here
 * before using this primitive for an unknown-duration loading indicator.
 */
@Directive({
  selector: 'hlm-progress',
  hostDirectives: [{ directive: BrnProgress, inputs: ['value', 'max', 'getValueLabel'] }],
  host: { 'data-slot': 'progress' },
})
export class HlmProgress {
  /** 'muted' draws the track in the muted surface color instead of a tint of the fill. */
  readonly variant = input<ProgressVariants['variant']>('default');

  constructor() {
    classes(() => progressVariants({ variant: this.variant() }));
  }
}
