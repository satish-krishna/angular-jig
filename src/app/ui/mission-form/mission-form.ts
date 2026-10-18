import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormField, FormRoot, form, validateStandardSchema } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import type { FormFieldMeta } from '../../forms/form-field-meta';
import { formMeta } from '../../forms/zod-meta';
import { missionSchema, type MissionFormModel } from '../../mission/mission.schema';

const meta = formMeta(missionSchema);
const STATUS_OPTIONS: NonNullable<FormFieldMeta['options']> = meta['status'].options ?? [];

/** Narrow whatever the caller passes down to exactly the schema's shape. */
const project = (value: MissionFormModel): MissionFormModel => ({
  codename: value.codename,
  objective: value.objective,
  status: value.status,
  priority: value.priority,
  threatId: value.threatId,
  startedOn: value.startedOn,
  debrief: value.debrief,
});

const sameValue = (a: MissionFormModel, b: MissionFormModel) =>
  a.codename === b.codename &&
  a.objective === b.objective &&
  a.status === b.status &&
  a.priority === b.priority &&
  a.threatId === b.threatId &&
  a.startedOn === b.startedOn &&
  a.debrief === b.debrief;

@Component({
  selector: 'app-mission-form',
  imports: [
    FormRoot,
    FormField,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmSwitchImports,
    HlmTextareaImports,
  ],
  templateUrl: './mission-form.html',
  styleUrl: './mission-form.css',
})
export class MissionForm {
  readonly initialValue = input<MissionFormModel>({
    codename: '',
    objective: '',
    status: 'Planned',
    priority: false,
    threatId: null,
    startedOn: '',
    debrief: '',
  });
  readonly threatOptions = input<ReadonlyArray<{ value: string; label: string }>>([]);
  readonly submitLabel = input('Save');
  readonly saveMission = output<MissionFormModel>();
  readonly cancel = output<void>();

  // Compared by value, not identity: a caller that hands us a fresh object with the
  // same contents on every change detection pass must not reseed the form mid-typing.
  private readonly seed = computed(() => project(this.initialValue()), { equal: sameValue });

  // linkedSignal, not signal: an input is not readable from a field initializer, so
  // `signal(this.initialValue())` freezes the form on the default and never shows the
  // mission being edited. This reseeds when the caller genuinely passes a different mission.
  protected readonly model = linkedSignal(() => this.seed());

  // The zod schema is the only validator: shape, rules, and labels all come from it.
  protected readonly missionForm = form(
    this.model,
    (path) => validateStandardSchema(path, missionSchema),
    {
      submission: {
        action: async (field) => {
          this.saveMission.emit(field().value());
        },
      },
    }
  );

  protected readonly meta = meta;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly statusToString = (value: string) =>
    STATUS_OPTIONS.find((option) => option.value === value)?.label ?? '';
  protected readonly threatToString = (value: string | null) =>
    this.threatOptions().find((option) => option.value === value)?.label ?? '';
}
