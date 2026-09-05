import { Injectable, inject } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Injectable()
export class AppViewModel {
  readonly theme = inject(ThemeService);

  toggleTheme() {
    this.theme.toggle();
  }
}
