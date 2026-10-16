import { describe, it, expect } from 'vitest';
import { classUses, expandTemplate } from './template.mjs';

const html = [
  '<section class="roster">',
  '  <h1 class="roster__title">Roster</h1>',
  '  @if (open) {',
  '    <div class="roster__filters flex">x</div>',
  '  }',
  '  @for (h of heroes; track h.id) {',
  '    <div class="roster__row" [class.roster__row--retired]="h.retired" [class]="h.x ? \'gap-2\' : \'roster__row--odd\'">{{ h.name }}</div>',
  '  }',
  '  <button hlmBtn [class.roster__retire]="true">Retire</button>',
  '</section>',
].join('\n');

describe('classUses', () => {
  it('lists static classes, [class.x] names and [class] string literals, inside control flow, with lines', () => {
    const uses = classUses(html).map((u) => `${u.line}:${u.via}:${u.token}`);
    expect(uses).toEqual([
      '1:class:roster',
      '2:class:roster__title',
      '4:class:roster__filters',
      '4:class:flex',
      '7:class:roster__row',
      '7:[class.x]:roster__row--retired',
      '7:[class]:gap-2',
      '7:[class]:roster__row--odd',
      '9:[class.x]:roster__retire',
    ]);
  });
});

describe('expandTemplate', () => {
  const utilities = new Map([
    ['roster', ['grid', 'gap-6']],
    ['roster__title', ['text-2xl', 'font-semibold']],
    ['roster__filters', ['flex', 'gap-3']],
    ['roster__row--retired', ['text-muted-foreground']],
    ['roster__retire', ['bg-red-500']],
  ]);

  it('replaces each class with its utilities and keeps unknown tokens', () => {
    const out = expandTemplate(html, utilities).split('\n');
    expect(out[0]).toBe('<section class="grid gap-6">');
    expect(out[1]).toBe('  <h1 class="text-2xl font-semibold">Roster</h1>');
    expect(out[3]).toBe('    <div class="flex gap-3 flex">x</div>');
  });

  it('folds [class.x] utilities into the class attribute, adding one when there is none', () => {
    const out = expandTemplate(html, utilities).split('\n');
    expect(out[6]).toContain('class="roster__row text-muted-foreground"');
    expect(out[8]).toBe('  <button class="bg-red-500" hlmBtn [class.roster__retire]="true">Retire</button>');
  });

  it('keeps the line count, including for CRLF input', () => {
    expect(expandTemplate(html, utilities).split('\n')).toHaveLength(10);
    const crlf = html.replaceAll('\n', '\r\n');
    const out = expandTemplate(crlf, utilities);
    expect(out.split('\r\n')).toHaveLength(10);
    expect(out.split('\r\n')[1]).toBe('  <h1 class="text-2xl font-semibold">Roster</h1>');
  });

  it('expands inside @switch and @defer too', () => {
    const t = '@switch (x) { @case (1) { <p class="roster__title">a</p> } }\n@defer { <p class="roster__title">b</p> }';
    expect(expandTemplate(t, utilities)).toBe(
      '@switch (x) { @case (1) { <p class="text-2xl font-semibold">a</p> } }\n@defer { <p class="text-2xl font-semibold">b</p> }',
    );
  });
});
