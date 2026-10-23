# Data Model: Plain Redesign and Research Blocks

All three entities are authored as HTML inside a lesson's `lesson.html`; there is no JSON store.
Markup is defined in [contracts/lesson-blocks.md](contracts/lesson-blocks.md).

## Paper card

| Field | Required | Rule |
|---|---|---|
| id | yes | `paper-<firstauthor><year>`, unique in the lesson (target for research-thinking links) |
| title | yes | exact published title; links to `href` |
| href | yes | open copy preferred (authors' page, archive), else DOI URL |
| paywalled | no | set when `href` may require a subscription; shows "(may need a subscription)" |
| authors | yes | ≤ 3 names in full; more → first author + "et al.", full list inside "More details" |
| venue | yes | journal/conference/thesis institution, as published |
| year | yes | publication year (for revised reports: first year, revision noted in More details) |
| takeaway | yes | one sentence, beginner wording, original |
| figure | no | small inline SVG or image with `alt`; no empty box when absent |
| details | no | "More details" fold-out: longer explanation and link back to the lesson section |

Validation (check): every `.paper` has non-empty title link, `.authors`, `.venue`, `.year`
(4 digits), `.takeaway`; ids unique.

## Research thinking block

| Field | Required | Rule |
|---|---|---|
| title | yes | short problem name |
| context | yes | 1–3 sentences setting up a real problem |
| question | yes | one question, visible |
| think prompt | yes | fixed text: "Think about it for a minute before opening the answers." |
| possible answers | yes | ≥ 2 items, each idea + one-line reason; inside a closed `<details>` |
| actual solution | yes | what was done, by whom, when, link to source and/or `#paper-…` card; closed `<details>` |

State: both fold-outs closed on load; reader opens them in any order (no gating).

## Margin note

| Field | Required | Rule |
|---|---|---|
| text | yes | ≤ 280 characters, first person |
| anchor paragraph | yes | the `<p>` immediately before the `<aside>` in `.prose` |

Layout state: margin (viewport ≥ 1200 px) or inline (< 1200 px); purely CSS.
