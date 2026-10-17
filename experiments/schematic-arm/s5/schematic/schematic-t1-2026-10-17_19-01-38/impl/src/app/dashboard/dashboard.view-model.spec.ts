import { TestBed } from '@angular/core/testing';
import { DashboardViewModel } from './dashboard.view-model';

describe('DashboardViewModel', () => {
  // Example roster: 12 heroes, power indexes summing to 994. Example missions: 2 live.
  // Example threats: 4 unresolved (Open or Engaged), 2 contained.
  let vm: DashboardViewModel;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DashboardViewModel] });
    vm = TestBed.inject(DashboardViewModel);
  });

  it('counts the roster', () => {
    expect(vm.rosterCount()).toBe(12);
  });

  it('counts the live missions and the unresolved threats', () => {
    expect(vm.liveMissions()).toBe(2);
    expect(vm.openThreats()).toBe(4);
  });

  it('rounds the average power across the roster', () => {
    expect(vm.averagePower()).toBe(83);
  });

  it('lists the four highest-power heroes, strongest first', () => {
    expect(vm.topHeroes().map((hero) => hero.name)).toEqual([
      'Aurora Vale',
      'Dr. Ion',
      'Rift',
      'Silverwing',
    ]);
  });

  it('lists the whole roster in the same power order', () => {
    expect(vm.roster().length).toBe(12);
    expect(vm.roster()[0].name).toBe('Aurora Vale');
  });
});
