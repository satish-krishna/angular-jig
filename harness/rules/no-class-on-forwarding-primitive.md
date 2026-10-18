# no-class-on-forwarding-primitive

> Plane: sealing. Index: [../sealing-spec.md](../sealing-spec.md). messageId: `classOnForwardingPrimitive`. Gate-only: no counter kind.

## What it forbids

Any `class` on a primitive whose component forwards its `class` input to an element inside its own template instead of styling its host. That covers a static `class="..."` attribute, `[class]="..."`, `[class.x]="..."` and `[ngClass]` (also `[attr.class]`). The elements are listed once, in `harness/gate/rules/forwarding-primitives.ts`:

| element | where its class lands | use instead |
| --- | --- | --- |
| `hlm-select-trigger` | the inner `<button brnSelectTrigger>` | `width`, `size`, `buttonId` |
| `hlm-switch` | the inner `<brn-switch>` | `size` |

## Why

Components here use emulated view encapsulation. Every rule in a component's stylesheet is compiled with that component's scope attribute, so `.settings__theme { @apply w-full }` matches only elements the component's own template rendered. A forwarding primitive takes your `class` and applies it to an element in the primitive's template, which carries the primitive's scope attribute and not yours. The class name ends up on a real element, DevTools shows it there, and the rule silently matches nothing.

This shipped once: a BEM class on `hlm-select-trigger` with a width rule in the consumer's stylesheet, in the slice generator's output. Build, lint and tests were green and every generated form select rendered at content width. The fix was a `width` input on the primitive. This rule stops the next person, or model, from writing the same thing by hand.

Directives cannot forward, they have no template, so their class stays on the host element you wrote and the stylesheet rule matches. Only components qualify, and `harness/gate/forwarding-primitives.test.mjs` scans `libs/ui` so a component that starts forwarding `class` cannot be added without being listed.

## Accepted form

    <hlm-select-trigger buttonId="theme-select" width="full">
    <hlm-switch size="sm" />

When no input covers what you need, add a variant or input to the primitive in `libs/ui` and select it from the template.

## Agent guidance

A primitive that forwards its class inward (`hlm-select-trigger`, `hlm-switch`) takes no `class`, `[class]`, `[class.x]` or `[ngClass]` at all: your stylesheet rule cannot reach the element the class lands on. Use its inputs (`width`, `size`), or add a variant or input to the primitive in `libs/ui`.

    Good: <hlm-select-trigger buttonId="theme-select" width="full">
    Bad:  <hlm-select-trigger buttonId="theme-select" class="settings__select">

## Known blind spots

- It knows only the elements in `forwarding-primitives.ts`. The drift test keeps that list honest against `libs/ui`, but a primitive vendored from somewhere else is invisible until it is in `libs/ui`.
- It checks the template of the consumer. A class applied by a host binding, a directive's `host: { class }`, or `Renderer2` is out of reach, and so is a class set from TypeScript, which `house-style` rule 6 already forbids.
- It has no counter twin. Like `no-unportalled-overlay`, it is gate-only, so the two engines do not cross-check each other on it.
