import type { HeroStatus } from './hero.model';

/** Badge tone for a roster status. MIA is the destructive state; Reserve is neutral. */
export type StatusTone = 'success' | 'warning' | 'secondary' | 'destructive';

const STATUS_TONE: Record<HeroStatus, StatusTone> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

/** The badge tone for a roster status. One definition, shared by every screen that shows a status. */
export function statusTone(status: HeroStatus): StatusTone {
  return STATUS_TONE[status];
}

/** Up to two initials from a hero's name, for the avatar fallback. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
