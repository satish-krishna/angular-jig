# no-class-on-forwarding-primitive

> Plane: sealing. Index: [../sealing-spec.md](../sealing-spec.md). messageId: `classOnForwardingPrimitive`. Gate-only: no counter kind.

## What it forbids

Passing a class to a primitive whose component applies a consumer-supplied class to an element inside its own template instead of its host. For each listed element the rule bans every way of writing that input. Where the input is `class`: a `class` attribute (static or interpolated), `[class]`, `[class.x]`, `[ngClass]` and `[attr.class]`. Where it is a named input: the attribute or the `[binding]` of that name. The elements and inputs are listed once, in `harness/gate/rules/forwarding-primitives.ts`:

| element | forwarded input | where it lands | use instead |
| --- | --- | --- | --- |
| `hlm-select-trigger` | `class` | the inner `<button brnSelectTrigger>` | `width`, `size`, `buttonId` |
| `hlm-switch` | `class` | the inner `<brn-switch>` | `size` |
| `hlm-sidebar` | `sidebarContainerClass` | the inner `data-slot="sidebar-container"` div | `side`, `variant`, `collapsible` |
| `hlm-paginated-tabs-list` | `tabListClass`, `paginationButtonClass` | the inner tab list and both paginator buttons | none takes a class from outside |

## Why

Components here use emulated view encapsulation. Every rule in a component's stylesheet is compiled with that component's scope attribute, so `.settings__select { @apply w-full }` matches only elements your own template rendered. A forwarding primitive applies the class to an element in the primitive's template, which carries the primitive's scope attribute and not yours, so the rule cannot reach it.

What actually happens to the class depends on how it is written, and none of the forms is useful:

- A static or interpolated `class` goes to the host element and to the inner control. The host carries your scope, so your rule does match it, but the host has no box of its own (`hlm-switch` is `display: contents`, `hlm-select-trigger` is an unstyled inline element). The control you see is untouched.
- `[class]` is taken by the primitive's input and lands only on the inner control, outside your scope.
- `[class.x]`, `[ngClass]` and `[attr.class]` style only the host, never the control.
- A named input such as `sidebarContainerClass` lands only on the inner element, outside your scope. It is also an appearance back door, because `no-appearance-on-primitive` only looks at `class`.

All of them are banned because none reliably lays out what the consumer sees, and a class that styles an invisible wrapper is a trap. This shipped once: a BEM class on `hlm-select-trigger` with a width rule in the consumer's stylesheet, in the slice generator's output. Build, lint and tests were green and every generated form select rendered at content width. The fix was a `width` input on the primitive.

A directive's own class stays on the element you wrote it on, so a BEM class on `hlmBtn` or `hlmInput` matches. Only a component with a template can move a class somewhere else, and `harness/gate/forwarding-primitives.test.mjs` scans `libs/ui` for them (see the blind spots for what it cannot see).

## Accepted form

    <hlm-select-trigger buttonId="theme-select" width="full">
    <hlm-switch size="sm" />

When no input covers what you need, add a variant or input to the primitive in `libs/ui` and select it from the template. If you only need to place the control in a grid, wrap it in an element of your own and put the class on that.

## Agent guidance

A primitive that forwards a class inward (`hlm-select-trigger`, `hlm-switch`, `hlm-sidebar`, `hlm-paginated-tabs-list`) takes no class from you: not `class`, `[class]`, `[class.x]` or `[ngClass]`, and not its named class inputs (`sidebarContainerClass`, `tabListClass`, `paginationButtonClass`). A class either lands on the invisible host or on an inner element your stylesheet cannot reach. Use its inputs (`width`, `size`, `side`, `variant`), or add a variant or input to the primitive in `libs/ui`, or wrap it in an element that carries your class.

    Good: <hlm-select-trigger buttonId="theme-select" width="full">
    Bad:  <hlm-select-trigger buttonId="theme-select" class="settings__select">
    Bad:  <hlm-sidebar sidebarContainerClass="app__rail">

## Known blind spots

- It knows only the elements in `forwarding-primitives.ts`. The drift test keeps that list in step with `libs/ui` by reading each component's source, but it is a textual scan, not a type-aware one.
- What the drift test cannot see: an input inherited from a base class (a component that extends a `Brn*` class and gets a class input from it), an input exposed through `hostDirectives`, a class that reaches the template through a helper function or an injected service rather than a computed in the component, and a template assembled in code. A component built any of those ways can forward a class and still pass the guard. Directives such as the `*hlmSelectPortal` family hand a `class` input to the CDK overlay panel; the rule does not look at those either, and today the app puts its BEM class on the content element itself, which keeps its scope.
- It checks the consumer's template. A class applied by a host binding, a directive's `host: { class }`, or `Renderer2` is out of reach, and so is a class set from TypeScript, which `house-style` rule 6 already forbids.
- It has no counter twin. Like `no-unportalled-overlay`, it is gate-only, so the two engines do not cross-check each other on it.
