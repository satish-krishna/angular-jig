import { type VariantProps, cva } from 'class-variance-authority';

export const iconVariants = cva('inline-flex shrink-0', {
  variants: {
    tone: {
      default: '',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning',
    },
  },
  defaultVariants: { tone: 'default' },
});

export type IconVariants = VariantProps<typeof iconVariants>;
