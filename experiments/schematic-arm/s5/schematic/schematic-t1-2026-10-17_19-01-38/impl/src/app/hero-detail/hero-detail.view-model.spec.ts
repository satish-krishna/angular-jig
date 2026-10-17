import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { HeroService } from '../hero/hero.service';
import { HeroDetailViewModel } from './hero-detail.view-model';

describe('HeroDetailViewModel', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let vm: HeroDetailViewModel;

  function setup(id: string): void {
    params = new BehaviorSubject(convertToParamMap({ id }));
    TestBed.configureTestingModule({
      providers: [
        HeroDetailViewModel,
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
      ],
    });
    vm = TestBed.inject(HeroDetailViewModel);
  }

  it('loads the hero named by the route id', () => {
    setup('2');
    expect(vm.hero()?.name).toBe('Dr. Ion');
  });

  it('follows the route when only the id changes', () => {
    setup('2');
    params.next(convertToParamMap({ id: '4' }));
    expect(vm.hero()?.name).toBe('Aurora Vale');
  });

  it('has no hero for an unknown id', () => {
    setup('does-not-exist');
    expect(vm.hero()).toBeUndefined();
  });

  it('saves the edit, returns to the overview and says so', () => {
    setup('1');
    const service = TestBed.inject(HeroService);
    const hero = vm.hero();
    expect(hero).toBeDefined();
    vm.selectTab('edit');
    vm.save({
      name: 'Silverwing II',
      alias: hero?.alias ?? '',
      powerClass: 'Aerial',
      power: 90,
      status: 'Active',
      notes: '',
    });
    expect(service.byId('1')?.name).toBe('Silverwing II');
    expect(vm.activeTab()).toBe('overview');
    expect(vm.notice()).toContain('Silverwing II');
  });

  it('cancelling the edit returns to the overview without saving', () => {
    setup('1');
    vm.selectTab('edit');
    vm.cancelEdit();
    expect(vm.activeTab()).toBe('overview');
    expect(TestBed.inject(HeroService).byId('1')?.name).toBe('Silverwing');
  });

  it('deploying an active hero launches a live mission against the top unresolved threat', () => {
    setup('1');
    vm.deploy();
    const live = vm.missions().find((item) => item.outcome === 'Active');
    expect(live?.threatName).toBe('Hollow Signal');
    expect(vm.activeTab()).toBe('missions');
    expect(vm.notice()).toContain('Hollow Signal');
  });

  it('does not deploy a hero who is not active', () => {
    setup('5');
    expect(vm.canDeploy()).toBe(false);
    expect(vm.deployHint()).toContain('Injured');
    vm.deploy();
    expect(vm.missions().some((item) => item.outcome === 'Active')).toBe(false);
  });

  it('retiring removes the hero from the roster', () => {
    setup('3');
    vm.retire();
    expect(TestBed.inject(HeroService).byId('3')).toBeUndefined();
    expect(vm.hero()).toBeUndefined();
  });
});
