# The sealing spec (Part 1)

The single written contract that both the gate and the structural counter encode, independently and in different engines. The gate parses templates with angular-eslint; the counter parses them with Angular's own compiler (`@angular/compiler`). Neither shares code with the other. This document is the only place the rules are stated in prose; if the two encodings ever disagree on a fixture, this file is the arbiter, and one of the encodings is wrong.

## Why this exists

A vocabulary of primitives with an open passthrough is not a vocabulary, it is a suggestion. `hlmBtn` carries its own full styling through the `classes()` helper, but that same helper merges any raw `class` you put on the element, so nothing stops an agent from reaching straight past the primitive. Sealing is the load-bearing move of Part 1: it is what gives every later gate something decidable to check against. The three rules below are the seal.

## The vocabulary, as installed

Read from source, not from memory. The primitive selectors present in `libs/ui` at this substrate commit:

- `button[hlmBtn], a[hlmBtn]` (the button directive)
- `[hlmInput]` (the input directive)
- `[hlmCard], hlm-card`
- `[hlmCardHeader], hlm-card-header`
- `[hlmCardFooter], hlm-card-footer`
- `[hlmCardTitle]`
- `[hlmCardDescription]`
- `[hlmCardContent]`
- `[hlmCardAction]`

The set of primitive attribute names, used by rules 1 and 2:

`hlmBtn, hlmInput, hlmCard, hlmCardHeader, hlmCardFooter, hlmCardTitle, hlmCardDescription, hlmCardContent, hlmCardAction`

The set of primitive element names (spartan component selectors):

`hlm-card, hlm-card-header, hlm-card-footer`

## The three rules

Every violation is one of exactly three kinds. The gate reports them by `messageId`; the counter tallies them by `kind`. The kind strings are the shared vocabulary and must match on both sides:

### 1. `raw-control`: a native control element where a primitive exists

A native control element that a primitive already covers, used without the primitive directive, is a violation. For the vocabulary as installed, the covered controls are:

- a `<button>` element that does not carry the `hlmBtn` attribute
- an `<input>` element that does not carry the `hlmInput` attribute

A bare `<a>` is not a violation: the anchor is a legitimate navigation element, and `hlmBtn` on an anchor is opt-in styling, not a required seal. Only elements whose native role duplicates a primitive are covered. `<textarea>` and `<select>` are not counted at this substrate because no primitive covers them yet; when a primitive is added, its native element joins this list and both encodings extend together.

### 2. `class-on-primitive`: an arbitrary class string on a primitive

A `class` attribute, an `[attr.class]` binding, a `[class]` binding, a `[ngClass]` binding, or any `[class.foo]` shorthand, applied to an element that carries a primitive (a primitive attribute from the set above, or a primitive element name), is a violation. The primitive owns its appearance; a class reaching onto it is the passthrough the seal closes.

Class strings on non-primitive elements (a plain layout `<div>`, for example) are NOT a rule-1-through-3 violation here. That is deliberate and is the one deferral this spec makes explicit below.

### 3. `style-attribute`: an inline style anywhere

A `style` attribute, a `[style]` binding, any `[style.foo]` shorthand, or an `[ngStyle]` binding, on any element at all, is a violation. Inline style is the rawest possible reach past both the vocabulary and the layout grammar, so it is banned outright rather than only on primitives.

## The one deferral, stated out loud

The Part 1 resumption brief phrased rule 2 as "no arbitrary class strings on primitives and no layout `<div>` abuse." The primitive half is decidable now and is rule 2 above. The "layout `<div>` abuse" half is NOT decidable at Part 1, because there is no layout grammar yet to measure a `<div>` against: a `<div class="flex gap-2">` is only abuse relative to a rule that says how layout is allowed to be expressed, and that rule is Part 2 (layout as a grammar). Counting it now would mean inventing an ad hoc definition of abuse that Part 2 would then have to overwrite. So Part 1 seals the primitives and leaves general class-on-container to Part 2. This is a scope line, drawn on purpose, not an oversight. Both the gate and the counter honor it: neither flags a class on a non-primitive element.

## The tally shape (the counter's output contract)

The counter emits one JSON object. The gate does not emit JSON (it exits non-zero with a message), but it reports the same three `messageId`s that map one-to-one onto these kinds. Shape:

```json
{
  "totals": { "raw-control": 0, "class-on-primitive": 0, "style-attribute": 0, "all": 0 },
  "violations": [
    {
      "kind": "raw-control",
      "file": "src/app/dashboard/dashboard.ts",
      "line": 12,
      "detail": "button without hlmBtn"
    }
  ]
}
```

`totals.all` is the sum of the three kind totals. `violations` is ordered by file, then line, then kind, so the same input always serializes to byte-identical output. That ordering is what makes the determinism self-test (same committed diff in, identical tally out) meaningful rather than accidental.

## What each engine parses

- The gate loads angular-eslint's template parser and runs three custom rules over the template AST, one per kind. It runs on `.html` templates and on inline `template:` strings in `@Component` decorators, via angular-eslint's inline-template processor.
- The counter loads `@angular/compiler`'s `parseTemplate` and walks the resulting AST. It reads `.html` files directly and extracts inline `template:` strings from `.ts` component files using the TypeScript compiler API. It shares no rule code, no parser, and no AST types with the gate.

Two engines, one spec. If they ever disagree, that disagreement is the finding, and it is reported, not smoothed over.
