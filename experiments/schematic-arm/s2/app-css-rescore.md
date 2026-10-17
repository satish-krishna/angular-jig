# Phase 2 trees rescored for appearance in app css

This is the eight phase 2 trees (six trials and two pilots) rescored with the phase 3 kind `appearance-in-app-css`, as a reference for phase 3. These runs had neither the layout-only rule nor the typography and icon primitives, so the numbers show how far each tree sat from the new rule, not how an agent behaves under it. Counts are one per (rule, utility or property) that R7 or R7a forbids, in `src/app` stylesheets and `src/styles.css`. The gate and the counter agree on every tree, file for file and line for line. The split is text utilities (`text-*` sizes and colors, `font-*`, `leading-*`, `tracking-*`, `tabular-nums` and the like, plus the matching plain properties), padding off the block root, and all other appearance (anything on neither of the first two lists).

## Gate-off trials

| run id | appearance-in-app-css | text utilities | padding off root | other appearance |
| --- | --- | --- | --- | --- |
| gate-off-t1-2026-10-16_18-52-50 | 93 | 82 | 1 | 10 |
| gate-off-t2-2026-10-16_20-13-33 | 142 | 103 | 15 | 24 |
| gate-off-t3-2026-10-16_21-26-13 | 105 | 82 | 14 | 9 |
| mean | 113.3 | 89.0 | 10.0 | 14.3 |

## Gate-on trials

| run id | appearance-in-app-css | text utilities | padding off root | other appearance |
| --- | --- | --- | --- | --- |
| gate-on-t1-2026-10-16_19-25-51 | 139 | 99 | 13 | 27 |
| gate-on-t2-2026-10-16_20-48-54 | 169 | 130 | 10 | 29 |
| gate-on-t3-2026-10-16_22-08-24 | 110 | 78 | 14 | 18 |
| mean | 139.3 | 102.3 | 12.3 | 24.7 |

## Pilots (gate-off, earlier prompt)

| run id | appearance-in-app-css | text utilities | padding off root | other appearance |
| --- | --- | --- | --- | --- |
| gate-off-t1-2026-10-16_13-40-31 | 219 | 102 | 23 | 94 |
| gate-off-t1-2026-10-16_14-41-17 | 197 | 119 | 20 | 58 |

The gate-off baseline under the new rule is large: a mean of 113 forbidden (rule, utility) pairs per tree, against a phase 2 gate-off mean of 4.33 for the narrower question of appearance reaching a primitive. Text utilities are about four fifths of it in the trials (89 of 113), so most of the distance to the new rule is text styling that the typography directives are meant to absorb, and the rest is split between padding off the root and a small tail of other appearance. Gate-on is not lower here (139 against 113); the phase 2 gate only watched primitives, so it left every other stylesheet rule untouched, and one trial (t2) wrote 169 on its own. Counts are per rule and utility, so a tree that repeats `text-sm` in ten rules scores ten, and the figures measure how much styling lives in the app, not how many distinct tricks the agent used. With n=3 per arm and a spread of 93 to 169, the arm difference is not a finding; the useful number is the size of the baseline an agent starts from when the rule is absent.
