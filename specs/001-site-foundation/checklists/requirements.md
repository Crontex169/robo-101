# Specification Quality Checklist: Site Foundation

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-21
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- A few named platforms stay in the spec on purpose because the user fixed them as constraints:
  GitHub Pages (host), Chrome/Edge on Windows (check environment), `file://` (offline use). The
  build/runtime stack itself is left to the plan, which is bound by the constitution.
- Iteration 1 found a conflict between User Story 2 scenario 4 (progress on the home page) and
  FR-011 (sample lesson never in the program). Fixed by testing progress in a check-only build.

## Implementation validation (2026-10-22)

`node tools/check.js` passes 26 checks in about 10 s on Windows 11 with Chrome. The negative cases
from quickstart.md §5 each fail on the named step: a broken mission criterion, Cyrillic in the home
page, a published lesson that wasn't built, and a bad `CHROME_PATH`.

- SC-001: the home page shows the intro, the format, all seven parts (34 entries), and "Coming soon" on every unpublished entry. Verified by the check and the screenshots.
- SC-002: the sample lesson is the template, and the README lists the five steps to start a lesson. Timing is not measured yet; it will be measured on the first real lesson.
- SC-003: the full check takes about 10 s with no path edits.
- SC-004: zero Cyrillic in dist/ (assemble scan; vendored KaTeX CSS excluded), and no references to the reference site's servers.
- SC-005: home, glossary, 404 and the sample are all 390 px wide with no horizontal scroll, in both themes.
- SC-006: pages load only local files. External links are plain links, not requests.
