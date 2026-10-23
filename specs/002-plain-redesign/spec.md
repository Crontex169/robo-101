# Feature Specification: Plain Redesign and Research Blocks

**Feature Branch**: `002-plain-redesign`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "Plain redesign + research sections. (1) Restyle the whole site (home page and the lesson template) to a plain, document-like look modeled on https://lena-voita.github.io/nlp_course.html: one narrow text column, system font, plain links, sections divided by horizontal rules, no gradient text, no pill badges/chips, no eyebrow labels, no big rounded shadowed cards, colour only where it carries meaning (keep per-lesson meaning colours in figures/labs), dark mode kept. Labs stay interactive but framed simply. (2) Add three reusable lesson blocks: Related Papers, Research Thinking, and margin notes. Fixed small icon per block type. Sample lesson must demonstrate all three with real kinematics papers — references must be accurate, summaries original wording. Site and docs in English."

## Overview

The site works, but it looks like a product landing page: gradient headline, small uppercase
labels above every heading, pill-shaped badges, big rounded cards with shadows, a pair of
call-to-action buttons. The project owner finds this artificial. The model to follow is Lena
Voita's NLP course: a page that reads like a teacher's notes. One narrow column of text, a plain
font, plain links, horizontal rules between sections, and colour only where it means something.
The personality comes from the writing, the figures and the author's own asides, not from
decoration.

At the same time, Voita's course has blocks that make a lesson feel like an invitation into the
field rather than a closed textbook chapter: cards for the papers behind an idea, "research
thinking" exercises that ask the reader to come up with the idea themselves before showing who
did, and the author's short personal notes in the margin. This feature brings those three blocks
to our lessons.

When this is done, the home page, the sample lesson and the glossary all look like plain
documents, and the sample lesson shows a working example of each new block that later lessons
can copy.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reader sees a plain, document-like site (Priority: P1)

A learner opens the home page and then the sample lesson. Both read like a well-kept set of
course notes: a single comfortable text column, a plain system font, ordinary underlined or
coloured links, sections separated by thin horizontal rules. There is no gradient lettering, no
uppercase label above each heading, no pill-shaped badges, no large floating cards with shadows,
and no pair of big call-to-action buttons. Labs are still fully interactive, framed by a thin
border instead of a raised card. Light and dark themes both work.

**Why this priority**: the owner's main complaint is the look. Every later lesson inherits the
template, so the style has to be fixed before more lessons are written.

**Independent Test**: build the site, open the home page, the sample lesson and the glossary in
light and dark themes at desktop and 390 px width, and confirm none of the banned decorations
appear and everything still works (labs, missions, quiz, warm-up, glossary popups, theme toggle,
progress).

**Acceptance Scenarios**:

1. **Given** the home page, **When** a reader opens it, **Then** the title is plain text in one
   ink colour, the intro is a paragraph, and the program is a plain list of parts and lessons
   separated by rules, with no badges, chips or gradient text.
2. **Given** the sample lesson, **When** a reader scrolls through it, **Then** every section is
   separated by a horizontal rule, section headings carry no uppercase label above them, and the
   lab sits inside a thin-bordered frame without shadow.
3. **Given** dark theme, **When** the reader toggles it, **Then** the same plain layout appears
   with light text on a dark background and all meaning colours stay readable.
4. **Given** a 390 px wide screen, **When** the reader opens any page, **Then** there is no
   horizontal scrolling and the text column fills the width with a small side margin.

---

### User Story 2 - Reader explores the papers behind an idea (Priority: P2)

At the end of a lesson, the reader finds a "Related papers" section. Each paper is a short card:
the title linking to the paper, the authors, the venue and year, and one sentence saying what the
paper contributed in plain words. Some cards have a small figure. Each card has a "More details"
fold-out with a longer, still beginner-friendly explanation of the idea and how it connects to
the lesson.

**Why this priority**: it is the block the owner asked for by name, and it gives curious readers
a path from the lesson into the real literature.

**Independent Test**: open the sample lesson, find the Related papers section, confirm at least
three cards with title link, authors, venue, year and a one-line takeaway, open and close a "More
details" fold-out with mouse and keyboard, and check every citation against the paper itself.

**Acceptance Scenarios**:

1. **Given** the Related papers section, **When** the reader looks at a card, **Then** they see
   title (linked), authors, venue and year, and a one-sentence takeaway, without opening anything.
2. **Given** a collapsed card, **When** the reader activates "More details", **Then** a longer
   explanation appears, and activating it again hides it.
3. **Given** any paper card, **When** a reviewer checks the citation, **Then** title, authors,
   venue and year match the published paper exactly.

---

### User Story 3 - Reader tries to think like a researcher (Priority: P2)

Inside or at the end of a lesson, the reader meets a "Research thinking" block. It sets up a
real problem in a few sentences, asks a question, and tells the reader to think before looking.
Below that, a fold-out reveals possible answers. A second fold-out reveals what was actually done
and by whom, linking to the paper (and to its card in Related papers when there is one).

**Why this priority**: it turns the reader from a consumer of formulas into someone who could
have found them, which is the spirit the owner liked in the reference course.

**Independent Test**: open the sample lesson, find the Research thinking block, confirm the
question is visible while answers and the real solution are hidden, then reveal each in order.

**Acceptance Scenarios**:

1. **Given** a Research thinking block, **When** the reader first sees it, **Then** only the
   context, the question and a "think first" prompt are visible.
2. **Given** the block, **When** the reader opens "Possible answers", **Then** two or more
   candidate ideas appear, each with a short reason.
3. **Given** the block, **When** the reader opens "What was actually done", **Then** they see the
   real approach, who proposed it and when, with a link to the source.

---

### User Story 4 - Reader hears the author's voice (Priority: P3)

Here and there in the text, the author leaves a short first-person note: a tip, a warning, a
personal remark ("I got this sign wrong for a week the first time"). On a wide screen the note
sits in the margin next to the paragraph it belongs to. On a narrow screen it appears inline,
right after that paragraph, set apart by a thin left rule.

**Why this priority**: the cheapest way to make the site feel written by a person. Lower than the
other stories because it depends on actual lesson writing to shine.

**Independent Test**: open the sample lesson at desktop width and confirm at least one note sits
in the margin beside its paragraph; narrow to 390 px and confirm it moves inline below that
paragraph and nothing overlaps.

**Acceptance Scenarios**:

1. **Given** a desktop-width screen, **When** the reader reaches a paragraph with a note,
   **Then** the note appears in the side margin aligned with that paragraph.
2. **Given** a 390 px screen, **When** the reader reaches the same paragraph, **Then** the note
   appears directly below it, inline, and the text stays readable.
3. **Given** a screen-reader user, **When** they reach the note, **Then** it is announced as an
   aside belonging to that part of the text.

### Edge Cases

- A paper has no freely accessible copy: the title links to the publisher or DOI page, and the
  card says so if the reader may hit a paywall.
- A paper card has no figure: the card lays out cleanly without an empty image box.
- Two margin notes sit on neighbouring paragraphs on a wide screen: they must not overlap; the
  second moves down.
- The reader opens a page with JavaScript disabled: fold-outs still open and close, and margin
  notes are still visible.
- Long author lists (more than three authors): show the first author plus "et al." with the full
  list in "More details".
- Print: fold-outs print expanded so the printed page is complete.

## Requirements *(mandatory)*

### Functional Requirements

**Plain look (applies to home page, lesson template and glossary)**

- **FR-001**: Body text MUST sit in a single column no wider than about 75 characters per line;
  figures and labs MAY be wider than the text column.
- **FR-002**: Text MUST use the reader's system font stack; the site MUST NOT load web fonts
  for text (the math typesetting fonts are the only exception).
- **FR-003**: Sections MUST be separated by thin horizontal rules, not by alternating background
  bands or raised cards.
- **FR-004**: Pages MUST NOT use gradient-coloured text, uppercase "eyebrow" labels above
  headings, pill/chip badges, drop shadows on content blocks, or corner rounding larger than a few
  pixels.
- **FR-005**: Colour MUST be used only where it carries meaning: links, the per-lesson meaning
  colours inside figures, labs and formulas, mission pass/fail states, and the tinted background
  of the three new blocks. Headings and body text use one ink colour.
- **FR-006**: The home page MUST present the course as a plain document: title, a short
  first-person intro, how a lesson works as short paragraphs, the program as a plain list with
  rules between parts, who it is for, and questions. It MUST keep the "continue where you left
  off" link as a plain text link.
- **FR-007**: The lesson header MUST be plain: lesson number and title, a one-line description,
  and time and lab counts as plain text, not badges.
- **FR-008**: Labs MUST keep all current behaviour (direct manipulation, missions, live checks,
  readouts) and be framed by a thin border with no shadow.
- **FR-009**: The top bar MUST be a thin line of text links (site title, lesson sections,
  glossary, theme toggle), not a heavy navigation bar.
- **FR-010**: Light and dark themes, the theme toggle, reading progress, warm-up, quiz, glossary
  popups and the "Under the hood" fold-outs MUST keep working.

**New lesson blocks**

- **FR-011**: The system MUST offer a Related papers block made of paper cards. Each card MUST
  show: title linked to the source, authors, venue, year and a one-sentence takeaway. A card MAY
  show a small figure and MAY have a "More details" fold-out.
- **FR-012**: The system MUST offer a Research thinking block with: a short context, a question,
  a "think first" prompt, a "Possible answers" fold-out, and a "What was actually done" fold-out
  naming the real approach, its authors and year, with a link to the source.
- **FR-013**: The system MUST offer a margin note block: a short first-person aside tied to a
  paragraph, shown in the side margin on wide screens and inline below the paragraph on narrow
  screens, and exposed to assistive technology as an aside.
- **FR-014**: Each of the three block types MUST carry its own small, fixed icon used the same
  way on every page, and the same icon MUST mark the block in the lesson's section navigation
  where the block is a section.
- **FR-015**: All fold-outs in the new blocks MUST work with mouse, touch and keyboard, without
  JavaScript, and MUST print expanded.
- **FR-016**: The sample lesson MUST contain one Related papers section with at least three
  cards, at least one Research thinking block, and at least two margin notes, all on topics that
  fit a planar arm's kinematics, so authors can copy them.
- **FR-017**: Every citation in the sample lesson MUST be accurate (title, authors, venue, year)
  and checked against the original publication; every summary MUST be in the project's own words.
- **FR-018**: The automated site check MUST cover the new blocks: presence of the required
  fields on every paper card, fold-outs closed by default and opening on activation, margin note
  placement at desktop and at 390 px, and absence of the banned decorations from FR-004.

### Key Entities

- **Paper card**: one paper. Title, source link, authors, venue, year, one-line takeaway,
  optional figure, optional "More details" text, optional note that the source may be paywalled.
- **Research thinking block**: context, question, possible answers (two or more, each with a
  short reason), actual solution (description, authors, year, link, optional link to a paper
  card).
- **Margin note**: short first-person text and the paragraph it belongs to.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On the home page, sample lesson and glossary, zero instances of gradient text,
  eyebrow labels, pill badges, shadowed content cards or large corner rounding remain (checked
  automatically).
- **SC-002**: The project owner, comparing the new pages side by side with the reference course,
  judges them "plain and natural" rather than "artificial".
- **SC-003**: Every interactive feature that passed the site check before this change still
  passes after it.
- **SC-004**: 100 % of the citations in the sample lesson match the original publication on
  title, authors, venue and year.
- **SC-005**: A lesson author can add a new paper card, research thinking block or margin note
  by copying one example from the sample lesson and editing only its text, in under 5 minutes.
- **SC-006**: All pages pass the existing 390 px and dark-theme checks with no horizontal scroll
  and no overlapping elements.
- **SC-007**: Pages are no heavier than before: total size of each built page does not grow by
  more than 10 % excluding the new block content.

## Assumptions

- The project constitution gets a new principle, "Plain pages", recording this visual style so
  every later lesson follows it; the owner approved the direction on 2026-10-23.
- "Look like Voita's course" means the same kind of plainness, not a copy of her layout,
  illustrations, icons or text. We draw our own icons; her content is not reused.
- The per-lesson meaning colours (blue, orange, purple) stay as they are inside figures, labs and
  formulas; only decorative colour is removed.
- The glossary page and the 404 page follow the same plain style as part of this change.
- A "Have fun" mini-game block and step-by-step figure strips are out of scope here and may come
  in a later feature.
- Paper links prefer an openly accessible copy (author page, open archive) and fall back to the
  publisher or DOI page.
- The sample lesson's research content is a working example for authors; real lessons will get
  their own papers and research questions when they are written.
