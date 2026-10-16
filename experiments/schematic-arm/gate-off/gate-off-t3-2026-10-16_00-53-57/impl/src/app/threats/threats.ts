import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { statusVariant } from '../ui/hero-status-variant';
import { ThreatsViewModel } from './threats.view-model';

/** The threats screen: which clearance tiers can respond, and the heroes who need follow-up. All state lives in ThreatsViewModel. */
@Component({
  selector: 'app-threats',
  imports: [RouterLink, HlmBadgeImports, HlmCardImports, HlmTableImports],
  providers: [ThreatsViewModel],
  template: `
    <div class="flex flex-col gap-8">
      <header class="min-w-0">
        <h1 class="text-2xl font-semibold">Threats</h1>
        <p class="text-sm text-muted-foreground">
          Clearance gates every response. Example threat scale, for demonstration only.
        </p>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="tier-table-heading" class="flex flex-col gap-4">
          <h2 id="tier-table-heading" class="text-lg font-semibold">Response capacity by tier</h2>
          <div hlmTableContainer>
            <table hlmTable aria-labelledby="tier-table-heading">
              <thead hlmTHead>
                <tr hlmTr>
                  <th hlmTh scope="col">Clearance</th>
                  <th hlmTh scope="col">Threat scale</th>
                  <th hlmTh scope="col" class="text-end">Cleared</th>
                  <th hlmTh scope="col" class="text-end">Ready now</th>
                </tr>
              </thead>
              <tbody hlmTBody>
                @for (row of vm.tiers(); track row.tier) {
                  <tr hlmTr>
                    <td hlmTd>
                      <span hlmBadge variant="outline">{{ row.tier }}</span>
                    </td>
                    <td hlmTd>{{ row.scale }}</td>
                    <td hlmTd class="text-end tabular-nums">{{ row.cleared }}</td>
                    <td hlmTd class="text-end tabular-nums">{{ row.ready }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <section hlmCard aria-labelledby="attention-heading" class="self-start">
          <div hlmCardHeader>
            <h2 id="attention-heading" hlmCardTitle>Need attention</h2>
            <p hlmCardDescription>Injured or missing heroes cannot respond until resolved.</p>
          </div>
          <div hlmCardContent>
            @if (vm.attention().length === 0) {
              <p class="text-sm text-muted-foreground">Every hero on the roster can respond.</p>
            } @else {
              <ul class="flex flex-col gap-3">
                @for (hero of vm.attention(); track hero.id) {
                  <li class="flex flex-wrap items-center justify-between gap-2">
                    <a class="font-medium underline-offset-4 hover:underline" [routerLink]="['/detail', hero.id]">{{
                      hero.name
                    }}</a>
                    <span class="flex flex-wrap gap-1">
                      <span hlmBadge variant="outline">{{ hero.clearance }}</span>
                      <span hlmBadge [variant]="statusVariant(hero.status)">{{ hero.status }}</span>
                    </span>
                  </li>
                }
              </ul>
            }
          </div>
        </section>
      </div>
    </div>
  `,
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
  protected readonly statusVariant = statusVariant;
}
