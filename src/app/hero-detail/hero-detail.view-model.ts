import { Injectable, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroService } from '../hero/hero.service';
import type { HeroFormModel } from '../hero/hero.schema';

@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // toSignal, not route.snapshot and not a .subscribe: the router reuses this
  // component when only the id changes, so a snapshot read in ngOnInit would
  // show the first hero forever. Converting the observable at the edge is the
  // house rule and, here, also the fix.
  private readonly params = toSignal(this.route.paramMap);

  readonly heroId = computed(() => this.params()?.get('id') ?? null);
  readonly hero = computed(() => {
    const id = this.heroId();
    return id ? this.heroService.byId(id) : null;
  });

  // Reseeds to false whenever the hero changes, so an open editor does not
  // follow the reader onto the next hero.
  readonly isEditing = linkedSignal(() => {
    this.heroId();
    return false;
  });

  saveHero(data: HeroFormModel) {
    const hero = this.hero();
    if (hero) {
      this.heroService.update(hero.id, data);
      this.isEditing.set(false);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  retireHero() {
    const hero = this.hero();
    if (!hero) return;
    this.heroService.retire(hero.id);
    this.router.navigate(['/roster']);
  }
}
