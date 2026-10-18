import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';

describe('Dashboard links', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the Recruit button as a link to /recruit', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
    );
    const recruit = links.find((a) => a.textContent?.includes('Recruit'));
    expect(recruit).toBeTruthy();
    expect(recruit!.getAttribute('href')).toBe('/recruit');
  });

  it('renders the "View all roster" link to /roster', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
    );
    const viewAll = links.find((a) => a.textContent?.includes('View all roster'));
    expect(viewAll).toBeTruthy();
    expect(viewAll!.getAttribute('href')).toBe('/roster');
  });
});
