export interface NavItem {
  readonly label: string;
  readonly path: string;
  /** Lucide icon name; registered with provideIcons on the App component. */
  readonly icon: string;
}

/** The six rail destinations. Hero detail is reached from the roster, so it has no rail entry. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  { label: 'Roster', path: '/roster', icon: 'lucideUsers' },
  { label: 'Missions', path: '/missions', icon: 'lucideTarget' },
  { label: 'Threats', path: '/threats', icon: 'lucideShieldAlert' },
  { label: 'Recruit', path: '/recruit', icon: 'lucideUserPlus' },
  { label: 'Settings', path: '/settings', icon: 'lucideSettings' },
];
