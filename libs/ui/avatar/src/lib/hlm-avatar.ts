import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BrnAvatar } from '@spartan-ng/brain/avatar';
import { classes } from '@spartan-ng/helm/utils';

const avatarBase =
  'size-8 data-[size=lg]:size-10 data-[size=sm]:size-6 group/avatar after:border-border relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten';

const avatarVariants = {
  default: 'rounded-full after:rounded-full',
  primary: 'rounded-lg bg-primary after:hidden',
} as const;

@Component({
  selector: 'hlm-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-slot': 'avatar',
    '[attr.data-size]': 'size()',
  },
  template: `
    @if (_image()?.canShow()) {
      <ng-content select="[hlmAvatarImage],[brnAvatarImage]" />
    } @else {
      <ng-content select="[hlmAvatarFallback],[brnAvatarFallback]" />
    }
    <ng-content />
  `,
})
export class HlmAvatar extends BrnAvatar {
  public readonly size = input<'default' | 'sm' | 'lg'>('default');

  /** 'primary' fills the avatar with the primary color as a rounded square and hides the border overlay. */
  public readonly variant = input<'default' | 'primary'>('default');

  constructor() {
    super();
    classes(() => [avatarBase, avatarVariants[this.variant()]]);
  }
}
