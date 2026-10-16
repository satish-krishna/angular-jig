import { Component, computed, input } from '@angular/core';
import { type BadgeVariants, HlmBadgeImports } from '@spartan-ng/helm/badge';
import type { HeroStatus } from '../../domain/hero.model';

type BadgeVariant = NonNullable<BadgeVariants['variant']>;

/** Each status carries its own colour; Reserve stays neutral because it is not a warning. */
const STATUS_VARIANT: Record<HeroStatus, BadgeVariant> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

/** A hero's status as a badge. Presentational: the status arrives as an input. */
@Component({
  selector: 'app-status-badge',
  imports: [HlmBadgeImports],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {
  readonly status = input.required<HeroStatus>();

  protected readonly variant = computed(() => STATUS_VARIANT[this.status()]);
}
