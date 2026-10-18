import { TestBed } from '@angular/core/testing';
import { PowerMeter } from './power-meter';

async function render(value: number, max?: number) {
  await TestBed.configureTestingModule({ imports: [PowerMeter] }).compileComponents();
  const fixture = TestBed.createComponent(PowerMeter);
  fixture.componentRef.setInput('label', 'Power');
  fixture.componentRef.setInput('value', value);
  if (max !== undefined) fixture.componentRef.setInput('max', max);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return {
    bar: root.querySelector('hlm-progress') as HTMLElement,
    indicator: root.querySelector('hlm-progress-indicator') as HTMLElement,
  };
}

describe('PowerMeter', () => {
  it('renders an empty bar instead of throwing when max is 0', async () => {
    const { indicator } = await render(5, 0);
    expect(indicator.style.width).toBe('0%');
  });

  it('renders an empty bar instead of throwing when max is negative', async () => {
    const { indicator } = await render(5, -10);
    expect(indicator.style.width).toBe('0%');
  });

  it('fills the bar but no further when the value is above max', async () => {
    const { bar, indicator } = await render(150, 100);
    expect(indicator.style.width).toBe('100%');
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
  });

  it('reads the value text the way the visible text shows it', async () => {
    const { bar } = await render(150, 100);
    expect(bar.getAttribute('aria-valuetext')).toBe('150 / 100');
  });

  it('uses the default max of 100 in the value text', async () => {
    const { bar } = await render(42);
    expect(bar.getAttribute('aria-valuetext')).toBe('42 / 100');
  });

  it('is a meter, not a progressbar, with exactly one role', async () => {
    const { bar } = await render(92, 100);
    expect(bar.getAttribute('role')).toBe('meter');
    expect(bar.getAttribute('aria-valuenow')).toBe('92');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuetext')).toBe('92 / 100');
    expect(bar.getAttributeNames().filter((n) => n === 'role')).toEqual(['role']);
  });
});
