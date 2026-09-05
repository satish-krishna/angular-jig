import { Component } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle } from '@ng-icons/lucide';

@Component({
  selector: 'app-threats',
  imports: [HlmCardImports, HlmBadgeImports, HlmLabelImports, NgIconsModule],
  providers: [
    provideIcons({
      lucideAlertTriangle,
    }),
  ],
  template: `
    <div class="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Active Threats</h1>
        <p class="text-muted-foreground mt-2">Respond to incidents and assess risk levels</p>
      </div>

      <div class="flex flex-col gap-4">
        <div hlmCard>
          <div hlmCardHeader>
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <ng-icon name="lucideAlertTriangle" class="text-2xl text-destructive flex-shrink-0" />
                <div class="flex flex-col gap-1">
                  <h3 hlmCardTitle>Cyber Attack Detected</h3>
                  <p hlmLabel>Threat ID: THR-2026-0847</p>
                </div>
              </div>
              <span hlmBadge variant="destructive">Critical</span>
            </div>
          </div>
          <div hlmCardContent>
            Unauthorized access attempt on database servers. 5 heroes assigned. ETA 20 minutes.
          </div>
        </div>

        <div hlmCard>
          <div hlmCardHeader>
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <ng-icon name="lucideAlertTriangle" class="text-2xl text-warning flex-shrink-0" />
                <div class="flex flex-col gap-1">
                  <h3 hlmCardTitle>Structural Instability</h3>
                  <p hlmLabel>Threat ID: THR-2026-0843</p>
                </div>
              </div>
              <span hlmBadge variant="secondary">High</span>
            </div>
          </div>
          <div hlmCardContent>
            Building frame instability in downtown district. 3 heroes assigned for evacuation support.
          </div>
        </div>

        <div hlmCard>
          <div hlmCardHeader>
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <ng-icon name="lucideAlertTriangle" class="text-2xl text-info flex-shrink-0" />
                <div class="flex flex-col gap-1">
                  <h3 hlmCardTitle>Anomalous Energy Signature</h3>
                  <p hlmLabel>Threat ID: THR-2026-0841</p>
                </div>
              </div>
              <span hlmBadge variant="outline">Medium</span>
            </div>
          </div>
          <div hlmCardContent>
            Unusual energy readings detected near research facility. Investigation in progress.
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Threats {}
