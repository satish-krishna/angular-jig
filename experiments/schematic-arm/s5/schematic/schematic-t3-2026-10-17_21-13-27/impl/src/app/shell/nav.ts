export interface NavDestination {
  readonly path: string;
  readonly label: string;
  /** Lucide icon name, registered with provideIcons in the shell. */
  readonly icon: string;
}

export interface Crumb {
  readonly label: string;
  readonly link?: string;
}

export const NAV_DESTINATIONS: readonly NavDestination[] = [
  { path: 'dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard' },
  { path: 'roster', label: 'Roster', icon: 'lucideUsers' },
  { path: 'missions', label: 'Missions', icon: 'lucideTarget' },
  { path: 'threats', label: 'Threats', icon: 'lucideShieldAlert' },
  { path: 'recruit', label: 'Recruit', icon: 'lucideUserPlus' },
  { path: 'settings', label: 'Settings', icon: 'lucideSettings' },
];

const ROOT_CRUMB: Crumb = { label: 'Hero Ops Console', link: '/dashboard' };

/** Builds the trail for a URL. The hero detail screen sits under the roster. */
export function crumbsFor(url: string): readonly Crumb[] {
  const segment = url.split(/[?#]/)[0].split('/')[1] ?? '';
  if (segment === 'detail') {
    return [ROOT_CRUMB, { label: 'Roster', link: '/roster' }, { label: 'Hero detail' }];
  }
  const destination = NAV_DESTINATIONS.find((item) => item.path === segment);
  return [ROOT_CRUMB, { label: destination?.label ?? 'Dashboard' }];
}
