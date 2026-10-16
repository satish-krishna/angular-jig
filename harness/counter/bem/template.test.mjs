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
  it('sees interpolated classes, template literals and unquoted object keys', () => {
    const t = [
      '<div class="roster {{ extra }} roster__a"></div>',
      '<div [class]="`roster__b ${x}`"></div>',
      '<div [class]="{ roster__c: on, \'roster__d flex\': off }"></div>',
    ].join('\n');
    expect(classUses(t).map((u) => `${u.line}:${u.via}:${u.token}`)).toEqual([
      '1:class:roster',
      '1:class:roster__a',
      '2:[class]:roster__b',
      '3:[class]:roster__d',
      '3:[class]:flex',
      '3:[class]:roster__c',
    ]);
  });
});

describe('classUses: interpolation literals', () => {
  it('reads string literals inside {{ }} in a class attribute, after the static tokens', () => {
    const t = `<div class="heroes__row {{ active ? 'bg-red-500 font-bold' : '' }}"></div>`;
    expect(classUses(t).map((u) => `${u.via}:${u.token}`)).toEqual(['class:heroes__row', 'class:bg-red-500', 'class:font-bold']);
  });
});

describe('expandTemplate: interpolation and modifiers', () => {
  it('expands mapped tokens from an interpolation and drops unmapped ones', () => {
    const m = new Map([['heroes__on', ['flex']]]);
    const t = `<div class="heroes__row {{ a ? 'heroes__on' : 'zzz' }}"></div>`;
    expect(expandTemplate(t, m)).toBe('<div class="heroes__row flex"></div>');
  });

  it('strips !, trailing ! and an opacity modifier from utilities it writes', () => {
    const m = new Map([['a', ['bg-blue-500/50', '!bg-red-500', 'sm:bg-blue-500/50', 'bg-green-500!']]]);
    expect(expandTemplate('<p class="a"></p>', m)).toBe('<p class="bg-blue-500 bg-red-500 sm:bg-blue-500 bg-green-500"></p>');
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

  it('keeps the line count when a class attribute spans lines', () => {
    const t = '<div class="roster\n  roster__title">x</div>\n<p class="roster__title">y</p>';
    const out = expandTemplate(t, utilities);
    expect(out.split('\n')).toHaveLength(3);
    expect(out.split('\n')[2]).toBe('<p class="text-2xl font-semibold">y</p>');
  });

  it('folds [class] literal and interpolated classes into one static class attribute', () => {
    const t = [
      '<div [class]="on ? \'roster__retire\' : \'\'">a</div>',
      '<div class="roster__title {{ x }}">b</div>',
      '<div class="{{ x }}" [class.roster__retire]="on">c</div>',
    ].join('\n');
    expect(expandTemplate(t, utilities).split('\n')).toEqual([
      '<div class="bg-red-500" [class]="on ? \'roster__retire\' : \'\'">a</div>',
      '<div class="text-2xl font-semibold">b</div>',
      '<div class="bg-red-500" [class.roster__retire]="on">c</div>',
    ]);
  });

  it('adds the class attribute to SVG elements', () => {
    const t = '<svg><path [class.roster__retire]="on" d="M0 0"></path></svg>';
    expect(expandTemplate(t, utilities)).toBe('<svg><path class="bg-red-500" [class.roster__retire]="on" d="M0 0"></path></svg>');
  });

  it('keeps the copy well-formed when a utility contains a quote', () => {
    const quoted = new Map([['roster__x', ['data-[state="open"]:bg-red-500']]]);
    expect(expandTemplate('<p class="roster__x">a</p>', quoted)).toBe('<p class="data-[state=\'open\']:bg-red-500">a</p>');
    expect(expandTemplate('<p class=roster__x>a</p>', quoted)).toBe('<p class="data-[state=\'open\']:bg-red-500">a</p>');
  });
});
