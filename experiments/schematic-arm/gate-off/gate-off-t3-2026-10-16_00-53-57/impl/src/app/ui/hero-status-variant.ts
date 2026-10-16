import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { HeroStatus } from '../domain/hero';

/** Status reads through the badge's own variants, so the call site carries no colour classes. */
export function statusVariant(status: HeroStatus): BadgeVariants['variant'] {
  switch (status) {
    case 'Active':
      return 'default';
    case 'Injured':
      return 'secondary';
    case 'Reserve':
      return 'outline';
    case 'MIA':
      return 'destructive';
  }
}
