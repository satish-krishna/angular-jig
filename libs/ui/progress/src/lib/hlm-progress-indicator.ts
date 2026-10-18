import { Directive } from '@angular/core';
import { BrnProgressIndicator, injectBrnProgress } from '@spartan-ng/brain/progress';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: 'hlm-progress-indicator',
  hostDirectives: [BrnProgressIndicator],
  host: {
    'data-slot': 'progress-indicator',
    '[style.width.%]': '_percent()',
  },
})
export class HlmProgressIndicator {
  private readonly _progress = injectBrnProgress();

  protected _percent(): number {
    const value = this._progress.value();
    const max = this._progress.max();
    return value == null || max <= 0 ? 0 : (value / max) * 100;
  }

  constructor() {
    classes(() => 'block h-full rounded-full bg-primary transition-all');
  }
}
