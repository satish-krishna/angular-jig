import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import { heroSchema, type HeroModel } from '../domain/hero.schema';
import type { Hero } from '../domain/hero';

@Injectable()
export class HeroDetailViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  private readonly heroId = signal<string | null>(null);
  private readonly _currentHero = signal<Hero | undefined>(undefined);
  private readonly _isEditing = signal(false);
  private readonly _isSaving = signal(false);
  private readonly _showRetireDialog = signal(false);
  private readonly _activeTab = signal('overview');

  readonly currentHero = this._currentHero.asReadonly();
  readonly isEditing = this._isEditing.asReadonly();
  readonly isSaving = this._isSaving.asReadonly();
  readonly showRetireDialog = this._showRetireDialog.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();

  readonly formName = signal('');
  readonly formAlias = signal('');
  readonly formPowerClass = signal<HeroModel['powerClass']>('Aerial');
  readonly formPowerIndex = signal(0);
  readonly formNotes = signal('');
  readonly formIsActive = signal(true);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.heroId.set(id);
        const hero = this.heroService.heroById(id);
        this._currentHero.set(hero);
      }
    });
  }

  setActiveTab(tab: string): void {
    this._activeTab.set(tab);
  }

  startEdit(): void {
    const hero = this._currentHero();
    if (hero) {
      this.formName.set(hero.name);
      this.formAlias.set(hero.alias);
      this.formPowerClass.set(hero.powerClass);
      this.formPowerIndex.set(hero.powerIndex);
      this.formNotes.set('');
      this.formIsActive.set(hero.status === 'Active');
      this._isEditing.set(true);
    }
  }

  cancelEdit(): void {
    this._isEditing.set(false);
  }

  async saveHero(): Promise<void> {
    const id = this.heroId();
    if (!id) return;

    const formData: HeroModel = {
      name: this.formName(),
      alias: this.formAlias(),
      powerClass: this.formPowerClass(),
      powerIndex: this.formPowerIndex(),
      notes: this.formNotes(),
      isActive: this.formIsActive(),
    };

    this._isSaving.set(true);
    try {
      const result = await heroSchema.parseAsync(formData);
      this.heroService.updateHero(id, {
        name: result.name,
        alias: result.alias,
        powerClass: result.powerClass,
        powerIndex: result.powerIndex,
        status: result.isActive ? 'Active' : 'Reserve',
      });
      this._currentHero.set(this.heroService.heroById(id));
      this._isEditing.set(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      this._isSaving.set(false);
    }
  }

  openRetireDialog(): void {
    this._showRetireDialog.set(true);
  }

  closeRetireDialog(): void {
    this._showRetireDialog.set(false);
  }

  confirmRetire(): void {
    const id = this.heroId();
    if (id) {
      this.heroService.updateHero(id, { status: 'MIA' });
      this._currentHero.set(this.heroService.heroById(id));
      this._showRetireDialog.set(false);
    }
  }
}
