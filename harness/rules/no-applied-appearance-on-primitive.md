# no-applied-appearance-on-primitive

> Plane: sealing. Spec: the house-style skill, [../../.claude/skills/house-style/SKILL.md](../../.claude/skills/house-style/SKILL.md) ("a primitive's look changes in libs/ui, as a variant"). messageId: `appliedAppearanceOnPrimitive`. Counter twin: the expanded `appearance-on-primitive` in `harness/counter/bem-counter.mjs`.

## What it forbids

An appearance utility reaching a primitive element through the component's own stylesheet. A class on a primitive (`<button hlmBtn class="roster__retire">`) is followed into the sibling `.css`, and every utility that class receives through `@apply` is judged, including under `&:hover` and `@media`. Appearance is the same set as `no-appearance-on-primitive`: color, typography, border, radius, shadow, ring, and internal padding.

## Why

Series 2 moved utilities out of templates into component stylesheets behind BEM names. The series 1 rule reads the template's class text, so it stopped seeing appearance on primitives. Both series 2 gate-off pilots put padding, radius and typography on primitives this way, 13 and 11 times, while the same model never did it in series 1, where the utilities sat beside the primitive in the template.

## Accepted form

    <input hlmInput variant="search" class="roster__search">
    .roster__search { @apply w-full sm:w-64; }

## Agent guidance

A primitive takes only layout from the app stylesheet: width, margin, position, grid placement. Its color, typography, border, radius, shadow and padding come from its own `variant` and `size` inputs. When no variant gives the look you need, add one to the primitive itself: edit its owned copy in `libs/ui`, add the variant to its `cva` with semantic tokens, and select it from the template.

    Good: <input hlmInput variant="search" class="roster__search">   .roster__search { @apply w-full sm:w-64; }
    Bad:  <input hlmInput class="roster__search">                    .roster__search { @apply w-full ps-9; }

## Known blind spots

- Global stylesheets and `:host` rules are not read; the counter still counts the first.
- Classes from an interpolation or a `[class]` binding are not followed; `[class.x]` modifiers are.
- `:is()` and `:where()` alternatives are not treated as the styled element.
- A stylesheet is checked only against the template with the same name in the same folder: a templateUrl pointing at a differently named file, a stylesheet shared through styleUrls, an inline template, or a .scss file is not checked.
- Writes made through the shell rather than the file tools are not seen by the hook; the counter still scores the final files.
