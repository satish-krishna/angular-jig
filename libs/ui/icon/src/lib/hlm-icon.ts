import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { type IconVariants, iconVariants } from './icon-variants';

// An icon's color comes from its tone, never from the app stylesheet. Size it
// with ng-icon's own `size` input or with layout (`size-*`); this directive has
// no size input because ng-icon already owns that name.
@Directive({
  selector: 'ng-icon[hlmIcon]',
  host: { 'data-slot': 'icon', '[attr.data-tone]': 'tone()' },
})
export class HlmIcon {
  public readonly tone = input<IconVariants['tone']>('default');

  constructor() {
    classes(() => iconVariants({ tone: this.tone() }));
  }
}
