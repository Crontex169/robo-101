# Research: Plain Redesign and Research Blocks

## R1. What "plain" means, measured

**Decision**: take the measurable parts of the reference course's stylesheet
(lena-voita.github.io `css/main.css`, ~6 KB) as the target. Do not copy its layout:

- Text column: `max-width: 42rem` (about 70–75 characters at 17 px). Figures and labs may use up
  to 60rem.
- Font: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` at
  17 px, line-height 1.6, weight 400. Headings weight 600, no negative letter-spacing beyond
  -0.01em, no `clamp()` display sizes. h1 at 2rem, h2 at 1.5rem, h3 at 1.15rem.
- Colours: light `--bg #fdfdfd`, `--ink #111`, `--ink-2 #333`, `--ink-3 #666`, `--line #e5e5e5`.
  Dark `--bg #151515`, `--ink #ececec`, `--ink-2 #cfcfcf`, `--ink-3 #9a9a9a`, `--line #2e2e2e`.
  Links `#1f6fd1` light, `#6aa8ff` dark, underlined. The meaning colours
  (`--classic`, `--e2e`, `--hybrid`, `--good`, `--critical`, …) keep their current names and values.
- Sections: `section + section { border-top: 1px solid var(--line) }`, padding 48px 0. No
  alternating background band.
- Blocks with a tint (paper card, research thinking, "Under the hood"): `background: var(--tint)`,
  1px border, radius 3px, no shadow.

**Rationale**: these are the numbers behind the "teacher's notes" feel. They are small enough to
enforce with a scan.

**Alternatives considered**: a serif body font (more bookish, but heavier on phones and further
from the reference); keeping Inter (the brief and Principle VII say no text web fonts).

## R2. Rewrite or patch the stylesheets

**Decision**: rewrite `lesson.css` and `site.css` from scratch and keep only selectors that a
page source or a shared JS module actually uses. The set is collected with a grep over
`lessons/**/*.{html,js}` and `site/*.src.html` for `class=`, `className`, `classList` and class
names in template strings. Restyle `lab.css`, `recall.css`, `check.css` and `glossary.css` in
place.

**Rationale**: about 380 of `lesson.css`'s 595 lines style components that only existed on the
reference site. Patching would keep the gradients, shadows and radii alive in dead rules. It
would also make the scan in R5 noisy.

**Alternatives considered**: overriding with a "plain" layer on top (doubles the CSS and leaves
dead rules); a utility framework (Principle V).

## R3. Controls vs decoration

**Decision**: content blocks get radius ≤ 3px and no shadow. Interactive controls (range
thumbs, quiz options, mission buttons, the theme toggle) may keep radius ≤ 6px and a focus
ring. The slider thumb is the one exception allowed a round shape. Buttons become plain bordered
text buttons. There is no filled black "primary" button except the single mission action
("Run").

**Rationale**: a control has to look like something you can press. Voita's quiz and game buttons
are plain bordered buttons too.

## R4. Fold-outs: native `<details>`, printing expanded

**Decision**: every fold-out in the new blocks is a `<details>`/`<summary>`. Two layers handle
printing. CSS: `@media print { details::details-content { content-visibility: visible; display:
block } }`, which current Chromium supports. A `beforeprint` handler in `ui-core.js` sets
`open` on every `details` and restores the old state on `afterprint`.

**Rationale**: `<details>` works with keyboard, touch and screen readers, and without JS. The
reference course uses JS show/hide toggles, which fail without scripts.

**Alternatives considered**: checkbox hacks (bad semantics); JS toggles (fail without JS,
FR-015).

## R5. Margin notes layout

**Update (implementation)**: a float can only start below its paragraph, not beside its top. The
note and its paragraph now sit in a `.noted` wrapper that becomes a two-column grid at ≥ 1200 px:
the note is top-aligned and can't overlap the next one. See contracts/lesson-blocks.md.

**Original decision**: the markup is `<aside class="mnote" aria-label="Author's note">` placed right after
the paragraph it belongs to, inside `.prose`. At ≥ 1200 px it floats into the right margin:
`float: right; clear: right; width: 13rem; margin-right: -15rem`. `clear: right` stacks
neighbouring notes instead of overlapping them. Below 1200 px it is an inline block with a 2px
left rule in `--ink-3`, smaller text (0.92em), and an initial "Note" label. Every note starts
with the author's small pen icon.

**Rationale**: pure CSS. It keeps document order, so screen readers read the note after its
paragraph, and floats handle the "two notes in a row" edge case.

**Alternatives considered**: CSS anchor positioning (too new for the phone browsers we target);
JS measurement (fragile, fails without JS).

## R6. Citations for the sample lesson (verified 2026-10-23)

**Decision**: the sample lesson uses these four papers. Every field was checked against the
publisher record or the authors' own page.

| # | Citation | Link used |
|---|---|---|
| 1 | J. Denavit, R. S. Hartenberg. "A Kinematic Notation for Lower-Pair Mechanisms Based on Matrices." *Journal of Applied Mechanics* 22(2): 215–221, 1955. | https://doi.org/10.1115/1.4011045 (publisher, paywalled) |
| 2 | D. L. Pieper. "The Kinematics of Manipulators Under Computer Control." PhD thesis, Stanford University, 1968 (Stanford AI Memo AIM-72). | https://apps.dtic.mil/sti/pdfs/AD0680036.pdf (free scan) |
| 3 | D. E. Whitney. "Resolved Motion Rate Control of Manipulators and Human Prostheses." *IEEE Transactions on Man-Machine Systems* 10(2): 47–53, 1969. | https://doi.org/10.1109/TMMS.1969.299896 (publisher, paywalled) |
| 4 | A. Aristidou, J. Lasenby. "FABRIK: A Fast, Iterative Solver for the Inverse Kinematics Problem." *Graphical Models* 73(5): 243–260, 2011. | https://www.andreasaristidou.com/FABRIK (authors' page; DOI 10.1016/j.gmod.2011.05.003) |

Kept for later lessons (Jacobian, Part 5), also verified: S. R. Buss, "Introduction to Inverse
Kinematics with Jacobian Transpose, Pseudoinverse and Damped Least Squares methods", unpublished
survey, UCSD, 2004, revised 2009. Its PDF is on mathweb.ucsd.edu. Yoshikawa 1985, Nakamura &
Hanafusa 1986 and Wampler 1986 will be verified when Part 5 is specified.

Note: some secondary sources cite Denavit & Hartenberg as volume 23. The ASME record (DOI above)
says volume 22, issue 2, June 1955, and we follow the publisher.

**Rationale**: these fit a planar-arm sample. DH is the systematic version of "adding up the
links". Pieper, Whitney and FABRIK are three different answers to the sample's open problem:
"guessing angles by hand is slow". That gives the research thinking block a natural
three-answer reveal.

## R7. Icons

**Decision**: three 16×16 single-stroke SVG icons drawn for this project: an open book (Related
papers), a light bulb (Research thinking) and a pen nib (margin note). Each is applied as a CSS
`mask-image` data URI on a `::before`, coloured `currentColor`, so it follows the theme and needs
no sprite in single-file lessons. The same `::before` marks the matching links in the lesson's
top-bar section list (`.toc a[data-block="papers"]` and so on).

**Rationale**: fixed icon per block type (FR-014) at zero extra requests.

## R8. Banned-decoration scan

**Decision**: `tools/plain_scan.js` runs in the page through `B.page().eval`. It walks every
visible element and flags any of the following:

- `background-clip: text`
- `text-transform: uppercase` on text longer than 3 characters
- a non-`none` `box-shadow` on anything that isn't a focused control or slider thumb
- `border-radius` > 4px on non-control elements, with circles in canvases and SVG excluded
- a `linear-gradient`/`radial-gradient`/`conic-gradient` background on anything except a range
  track
- any `@font-face` family other than KaTeX's

It returns a list of offenders and `check.js` fails on a non-empty list. It runs on the home
page, 404, glossary and sample lesson in both themes.

**Rationale**: it makes SC-001 automatic and stops the decoration from creeping back in later
lessons.

## R9. Home page as a document

**Decision**: the order is: title (h1 "Kinematics Workshop", plain), a first-person intro
paragraph, a small plain figure (the existing 3-link arm SVG at about 280px wide, no gradient
background), and a "Continue: M.1 Vectors and coordinate frames →" text link, which keeps
`#ctaMain` and `#ctaProgress` for the progress JS. Then come the "How a lesson works" paragraphs,
the Program (`#parts` stays, rendered as plain `<h3>` per part plus an `<ol>` of lessons where
`li[data-n][data-state]` stays for the check), "Who is this for" as two short lists, and
Questions as plain `<details>`.

**Rationale**: it keeps every hook the check and the progress script rely on. Everything
decorative goes.
