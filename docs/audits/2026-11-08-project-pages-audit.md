# Project pages audit, Nov 8 2026

Scope: /work/p2p-lending, /work/marketing-targeting, /work/house-prices, the LoyaltyAudit postscript on /work/american-airlines.
Rendered in headless Chrome at 1440x900, 1920x1080, 390x844 and 375x812 (worktree project-polish, dev server on 3002), plus the in-app browser at 1440. The site is dark only, so there is no light mode to check. Headless had no WebGL, so the dot grid is missing from those renders; everything else is real.

Ranked by impact on how the pages read and work. Nothing here changes a number or a claim.

## 1. The four pages are one template (identity)
- EYEBROW, H2, BODY, NOTE, WRAP and CARD are copy-pasted constants in all three page files, byte for byte. The AA postscript inlines the same values.
- Six horizontal bar lists share one recipe (label column, 10px rounded track, mono value, white 0.4 fill, periwinkle for the winner): P2P SHAP, House ladder, House SHAP, Marketing bars in all three cases, WhoVsWhat.
- Every page ends with the same numbered #0d0d0d method cards (four in a row) and the same mono-title deliverable cards.
- Every block enters with the same Rise (20px, 0.5s) and every bar grows with the same 0.8s ease. Motion is as uniform as the layout.
- Result: past the hero, a visitor cannot tell which page they are on. The heroes are distinctive (loan field, guess cards, estimator, chips); that identity stops at the first H2.

## 2. On phones, the result is off screen while you use the control (usability)
- House: the price sits below the five sliders. Dragging Year built at 375x812, the price is about 260px below the fold. The estimator's whole point is the live answer.
- P2P: the slider is above a 25x40 field roughly 550px tall, with the four readouts under it. Dragging the cutoff, you see neither the readouts nor the bottom of the field.
- AA postscript: the AUC readout and chips fit, fine.
- Marketing: the fixed "Your calls" tally covers the bottom right of the case cards on phones (and sits across the card frame at 1440).

## 3. Contrast and small text fail WCAG AA (accessibility)
- Eyebrows: 14px mono, white at 0.4 with 0.4em tracking on near-black, about 3.9:1 (needs 4.5:1). The tracking makes them harder still.
- Captions (NOTE) 12px at 0.42, legends at 0.5 to 0.55, ladder header 12px at 0.45: about 4:1 or below.
- AA postscript eyebrow: 10px at 0.22, about 1.9:1. It copies the AA page's section label, but it is the label for an interactive section.
- Readout labels in P2P are 11px at 0.45.

## 4. Charts are under-labelled (data design)
- Gains chart (Marketing case 1): no axis titles, the y axis has no ticks, labels float near the lines.
- Calibration (P2P): no y axis, no gridlines, only the actual rate is labelled; the drift story (predicted below actual) is not called out on the chart.
- Histogram (House): three x ticks for 25 bins, no y scale, and the placeholder spike is not annotated even though it is the headline.
- Bias chart (House, card 03): crammed into a 300px card; most bars are 1 to 6px wide, so the before and after are unreadable as bars and only the text carries it.
- Ladder (House): Lasso is highlighted while the blend below it is lower (5.2 vs 5.5). The copy explains why Lasso leads, but the chart reads as a mistake. Rows are not in value order either.
- P2P ladder: AUC differences of 0.001 to 0.019 shown as a plain table; fine for accuracy, but nothing shows the gap to the baseline.

## 5. Interaction details
- Marketing choices are buttons with role="radio" but no arrow-key movement and no roving tabindex; each is a tab stop. "Option 1 / 2 / 3" labels repeat what the position says. Unpicked choices are dark on dark and read as disabled before you pick.
- Marketing reveal grows inside the question card, so case cards become 1,000 to 1,400px tall single surfaces.
- P2P loan book: 425vh of pinned scroll with five steps; the progress ticks are not buttons, there is no way to jump a step, and the step text crossfades in place (ghosting visible mid-transition).
- House estimator: sliders show no min and max, nothing tells you how much the last change moved the price, the native select keeps the OS arrow, and the 0 to $500K range strip is a 2px line with three ticks.
- AA postscript: the chips read as five independent toggles; nothing marks the capstone's 0.997 on the meter, so "rebuild the 99 percent" has no target to reach.

## 6. Motion and reduced motion
- Reduced motion is handled on all four (Framer transitions to 0, the loan field snaps). Not emulated in a real browser yet.
- DotGridBackground throws an unhandled rejection when WebGL is unavailable (headless, some locked-down browsers). The page still renders, but there is no fallback texture. Site-wide, out of scope; logged as a follow-up.

## 7. Layout and rhythm
- Section padding alternates 120 / 40+120 / 96 with no system; the House page has five sections of identical rhythm.
- P2P and House deliverables are two cards; Marketing is one card at max 560px, which reads unfinished next to a full-width grid.
- At 1920 the 1200px column leaves 360px gutters each side; the heroes would carry more width (the loan field especially).

## 8. Known, not in scope
- AA page scrolls sideways on phones (scrollWidth 785 at 390). Fixed on branch aa-mobile (unmerged), which touches page.tsx and core-value-stats.tsx only; this pass touches loyalty-audit.tsx only.
- Inter is named but never loaded anywhere on the site (falls back to system-ui). Site-wide decision.

## What should stay shared (site identity)
Dot grid background, the Back pill, the H1 scale and weight, the periwinkle accent from lib/accent.ts, MONO for figures, the opaque card surface where a box is needed, the 2px pill border, first-person voice, and a common closing block for code and data links.

## What should become per page
Section headers, the chart language below the hero, how method and findings are presented, and the motion signature.
