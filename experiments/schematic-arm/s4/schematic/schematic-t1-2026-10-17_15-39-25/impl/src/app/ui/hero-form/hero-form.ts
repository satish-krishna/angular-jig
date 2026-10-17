import { Component, computed, input, output } from '@angular/core';
import { FormField, type FieldTree } from '@angular/forms/signals';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { heroSchema, type HeroModel } from '../../domain/hero.schema';
import type { ChoiceField } from '../../domain/hero-display';
import { formMeta } from '../../forms/zod-meta';

// Presentational: the hero record's fields, labelled from the zod schema. The host owns the model and
// writes it in response to the outputs; this component holds no state of its own beyond the view.
@Component({
  selector: 'app-hero-form',
  imports: [
    FormField,
    HlmFieldImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmSwitchImports,
    HlmTextareaImports,
  ],
  templateUrl: './hero-form.html',
  styleUrl: './hero-form.css',
})
export class HeroForm {
  readonly form = input.required<FieldTree<HeroModel>>();
  readonly choiceChange = output<{ field: ChoiceField; value: unknown }>();
  readonly activeChange = output<boolean>();

  protected readonly meta = formMeta(heroSchema);
  protected readonly fields = computed(() => this.form());
  protected readonly active = computed(() => this.fields().status().value() === 'Active');
}
