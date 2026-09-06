# Where corrective guidance lives, and why not in one place

## Status

Accepted. Implemented on `refactor/typed-rules-and-per-rule-docs` via `harness/rules/*.md`, `.claude/hooks/rule-docs.mjs` (`agentGuidanceFor`, `docsPointersFor`, `formatDocPointerBlock`), and the per-rule `meta.docs.url` generated for each of the 26 rules.

## Context

The originating brief's instinct was to avoid duplicating the same corrective text across the rule message, the hook's stderr output, and the rule's doc. That instinct is correct about maintenance and wrong about bytes on a screen, and this repo has two measurements that say so directly.

Part 3 of this repo's experiment series measured house-pattern adoption under two message designs: a prose reminder to follow the house pattern, and an inline worked example showing the accepted form. Adoption went from 0 of 3 runs to 3 of 3 runs when the worked example was made inline rather than described. The only variable that changed was whether the example was in front of the agent or merely referenced.

The capstone run measured the same failure shape at larger scale: across 36 subagents and 1,752 tool calls, the spartan MCP server — the documentation tool built specifically to answer composition questions about the UI primitives in use — was invoked zero times, and no skill was invoked either. The agent grepped library source instead of opening the doc that stated the requirement it then got wrong.

Both measurements point at the same fact: **availability is not consultation.** A doc the agent could open is not a doc the agent opens. A pointer is availability; it is not the same intervention as a worked example already inline in the text the agent is currently reading, and this repo has now measured the gap between those two twice, in two different experiments, at two different scales. Replacing measured inline guidance with a link would be trading a measured effect for an unmeasured one, on the strength of a style preference about duplication.

## Decision

### The three surfaces and what each carries

1. **Rule message** (the ESLint message string, shown inline at the offending line): the violation and the minimal fix, one sentence, with the offending name interpolated where possible. It has to stand alone in an editor gutter with no scrolling and no second click.
2. **Hook stderr** (the corrective text a blocked `PostToolUse` hook prints back to the agent): the violation list, a pointer to each fired rule's doc, and the doc's full worked example, spliced in inline via `agentGuidanceFor`.
3. **Rule doc** (`harness/rules/<rule-name>.md`): the complete argument for why the rule exists — including any history of the rule being wrong, which several of these docs record — the accepted form, and the rule's known blind spots.

### Why the worked example stays inline in the hook rather than becoming a link

This is the load-bearing call, and it cuts directly against the brief's framing. See Context above: Part 3's 0/3 -> 3/3 result and the capstone's zero MCP / zero skill invocations are both measurements of the same phenomenon under different conditions. An agent that already had the relevant doc available and never opened it, twice, at two different scales, is not an agent whose corrective loop should be redesigned to add one more hop before it sees the fix. The hook is a `PostToolUse` block: the agent is already stopped, already reading stderr, and already about to retry. That is the single highest-attention moment available in the loop, and it is exactly the moment the pointer-only design would spend on a link instead of the content.

### How the duplication is resolved without losing that

The prohibition on duplication is real and worth honoring, but it applies to *maintained text*, not to *bytes rendered on a screen*. This branch resolves it by keeping exactly one authored copy of the worked example — the `## Agent guidance` section of the rule's markdown doc — and generating both consumer-facing renderings from it at hook run time:

- `docsPointersFor` reads each fired rule's `meta.docs.url` off the ESLint results.
- `agentGuidanceFor` reads the corresponding doc file, extracts the `## Agent guidance` section, deduplicates by body (so four rules sharing one worked example print it once), and returns it for splicing into stderr.
- The doc itself renders the same section when a human or the agent opens it directly.

One author, one place to edit, two renderings. If the example goes stale, both surfaces go stale together and the drift is visible in one file's diff — there is no second copy to forget. This is the same shape of guarantee this branch already relies on elsewhere: `agentGuidanceFor`'s own doc comment states it plainly — "the MARKDOWN is the single source of truth: the hook text is generated from the doc rather than kept alongside it, so the two cannot drift and the doc cannot rot unnoticed."

### The verdict on the four-part message shape

The originating brief's proposal was a four-part shape per message — what, why, where, how — plus a worked example. Our hooks already deliver all five parts. They are just not delivered as one block in one place:

- **What** and **where**: in the rule message, at the offending line.
- **Why**, **how**, and the **example**: in the hook's stderr epilogue, generated from the doc.

This split is correct, not a compromise, because the two surfaces have different readers and different width budgets. The rule message is read in an editor gutter, one line at a time, often without the rest of the file's context on screen — a four-line message there is worse UX than a one-line message with a doc pointer, for a reader who is scanning a diagnostics list rather than blocked on a single edit. The hook epilogue is read by an agent that has just been stopped mid-turn, has the full corrective context in view, and benefits from the complete argument. Folding why/how/example into the rule message would degrade the editor-gutter case to fix a duplication that was never the actual cost.

**Adopt the completeness. Reject the packaging.**

## Kill switch

If a future gate-on trial shows house-pattern adoption falling back below the 3/3 that Part 3 established — with the inline-example design still in place — that is evidence the inline worked example is no longer doing the work this decision credits it with, and the docs-generation indirection (rendering from markdown instead of hardcoding the example in the hook) is the first thing to revert, in favor of directly investigating what changed in the agent or the harness rather than assuming the placement decision still holds.

## Consequences

- Every rule doc must keep an `## Agent guidance` section with a self-contained worked example, or the corresponding hook epilogue silently loses its example (see `docs/findings/2026-09-06-prompt-corrections.md`, item 11, for the CRLF failure mode this created and how it was fixed).
- Adding a new rule means writing the doc's `## Agent guidance` section before the rule is useful in the hook loop, not after.
- This decision does not extend to conceptual material outside a fired rule's blast radius — general house-style guidance still lives only in the house-style skill and CLAUDE.md, un-duplicated, because nothing here has measured that guidance going unread the way the spartan MCP and the Part 3 prose reminder were measured going unread.
