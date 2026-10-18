# app-css-layout-only

> Plane: sealing. Spec: the house-style skill, [../../.claude/skills/house-style/SKILL.md](../../.claude/skills/house-style/SKILL.md), rules 1 and 5. Counter twin: `appearance-in-app-css` in `harness/counter/bem-counter.mjs`. Also carries BEM rule 1: no utility class in a template.

## What it forbids

Any appearance in an app stylesheet. Every utility in `@apply` and every plain declaration in a stylesheet under `src/app`, and in any class rule of `src/styles.css`, must be on the layout list in the house-style skill. Padding is allowed only on the component's block root (`.<file-stem>`, `.<file-stem>--<modifier>`, `:host`). Unknown utilities count as appearance. In templates, no Tailwind utility may appear in a `class` attribute or a `[class.x]` binding.

## Why

Phase 2 gated appearance that reached a primitive through `@apply`. The model met that gate by moving the class onto a wrapper inside the primitive, or by deleting the primitive's directive and keeping its look on a plain element. Both kept the appearance in the app. This rule moves the line to where appearance may live: `libs/ui`.

## Accepted form

    <p hlmMuted>{{ hint }}</p>
    <ng-icon hlmIcon name="lucideShield" tone="muted" />
    .roster { @apply grid gap-6 p-6; }

## Agent guidance

The app stylesheet arranges things; it never decides how they look. For text, use a typography directive (`hlmH1`-`hlmH4`, `hlmP`, `hlmLead`, `hlmLarge`, `hlmSmall`, `hlmMuted`, `hlmCode`) or add a variant to one in `libs/ui/typography`. For an icon's color, use `<ng-icon hlmIcon tone="muted">` (`default`, `muted`, `primary`, `destructive`, `success`, `warning`). For a primitive's look, use its `variant` input, or add a variant to its `cva` in `libs/ui`. For a region's inset, put the padding on the block root (`.<file-stem>`). Moving the utilities onto a wrapper element, or removing a primitive's directive and keeping its look, is the same violation. In a template, use BEM class names only and put any layout utilities in the stylesheet.

    Good: <p hlmMuted>No heroes match.</p>                       .roster__empty { @apply col-span-full; }
    Bad:  <p class="roster__empty">No heroes match.</p>          .roster__empty { @apply py-8 text-muted-foreground; }

## Known blind spots

- Writes the hooks never see: a file changed outside `src/`, and changes made by a tool other than Write, Edit, MultiEdit or Bash.
- Inline `style` attributes and `[style.x]` bindings are not judged here (the series 1 `style-attribute` counter kind still counts the first).
- Classes built in TypeScript are not judged here (the counter's `utility-in-ts` kind counts them).
- A new component whose block-root padding exists only to pad one element is allowed by the letter of R7a; the readout reports such components.
