# Feature Specification: Turkish Site

**Feature Branch**: `004-turkish-site`

**Created**: 2026-10-23

**Status**: Done

**Input**: Owner decision: "Let's do it in Turkish first; I can fix Turkish wording and make it
sound natural more easily myself. Push after translating."

## Overview

The owner reverses the 2026-10-21 language decision: every reader-facing text on the site
becomes Turkish, so the owner can polish the wording by hand. Code, comments, specs and docs stay
English (constitution v1.3.0, Scope and Language).

## User Scenarios & Testing

### User Story 1 - A Turkish reader uses the whole site in Turkish (Priority: P1)

The home page, 404, glossary, lesson M.1 and the sample lesson read entirely in Turkish:
headings, prose, missions, readouts, warm-up, quiz, buttons, tooltips, aria labels, page titles,
descriptions and the link-preview image. Paper and book titles stay as published.

**Acceptance Scenarios**:

1. **Given** any page, **When** its visible text and labels are scanned, **Then** no English UI
   text remains except paper/book titles and the English term shown next to each glossary term.
2. **Given** the glossary or a term tooltip, **When** the reader looks at a term, **Then** the
   Turkish term, its English equivalent and a Turkish definition are shown.

## Requirements

- **FR-001**: All reader-facing strings in pages, shared modules (missions, quiz, warm-up,
  glossary tooltip, checkpoint, sorting cards, keyboard live text) and build-injected text are
  Turkish; `lang="tr"` and `og:locale` `tr_TR`.
- **FR-002**: The brand is "Kinematik Atölyesi".
- **FR-003**: Glossary entries gain an `en` field shown in tooltips and on the glossary page;
  aliases match Turkish suffixes (for example `vektör\w*`).
- **FR-004**: Notation (ᴬP, {A}, BORG) and numbers are unchanged; decimals keep the point, as in
  the course slides (open question for the owner: switch to the Turkish decimal comma).
- **FR-005**: Every existing check passes with Turkish strings.

## Success Criteria

- **SC-001**: `node tools/check.js` passes (72 checks).
- **SC-002**: A visible-text scan of every built page finds no English UI words outside
  paper/book titles.

## Assumptions

- Terms: vektör, bileşen, uzunluk (büyüklük), birim vektör, koordinat çerçevesi, orijin, konum
  vektörü, sağ elli çerçeve, uzuv, eklem, ileri/ters kinematik, çalışma uzayı, Jakobiyen.
- "Under the hood" becomes "Perde arkası"; "Research thinking" blocks keep their structure.
