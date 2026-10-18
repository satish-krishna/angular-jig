import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

export type HlmCardTitleEmphasis = 'default' | 'title';

@Directive({
  selector: '[hlmCardTitle]',
  host: { 'data-slot': 'card-title' },
})
export class HlmCardTitle {
  /** 'title' renders the page-title treatment a detail screen's card needs. */
  readonly emphasis = input<HlmCardTitleEmphasis>('default');

  constructor() {
    classes(() =>
      this.emphasis() === 'title'
        ? 'text-2xl leading-tight font-bold'
        : 'text-base leading-normal font-medium group-data-[size=sm]/card:text-sm',
    );
  }
}
