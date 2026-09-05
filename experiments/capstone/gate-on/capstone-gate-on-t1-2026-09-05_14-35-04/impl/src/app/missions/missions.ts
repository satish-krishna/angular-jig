import { Component } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

@Component({
  selector: 'app-missions',
  imports: [HlmCardImports, HlmBadgeImports],
  template: `
    <div class="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Active Missions</h1>
        <p class="text-muted-foreground mt-2">Monitor deployments and mission status</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Operation Aegis</h3>
          </div>
          <div hlmCardContent class="flex flex-col gap-3">
            <p class="text-sm text-muted-foreground">Secure facility against breach</p>
            <div class="flex flex-wrap gap-2">
              <span hlmBadge variant="default">4 agents</span>
              <span hlmBadge variant="outline">High priority</span>
            </div>
          </div>
        </div>

        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Mission Phoenix</h3>
          </div>
          <div hlmCardContent class="flex flex-col gap-3">
            <p class="text-sm text-muted-foreground">Rescue operation downtown</p>
            <div class="flex flex-wrap gap-2">
              <span hlmBadge variant="secondary">2 agents</span>
              <span hlmBadge variant="outline">Active</span>
            </div>
          </div>
        </div>

        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Operation Sentinel</h3>
          </div>
          <div hlmCardContent class="flex flex-col gap-3">
            <p class="text-sm text-muted-foreground">Perimeter defense setup</p>
            <div class="flex flex-wrap gap-2">
              <span hlmBadge variant="secondary">3 agents</span>
              <span hlmBadge variant="outline">Standby</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Missions {}
