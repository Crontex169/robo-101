# Contract: Lesson Source Format

This is what an author writes to add a lesson. `lessons/sample/` is the living example, and
`lessons/build.py` enforces the rules marked **(enforced)**.

## Files

```text
lessons/<key>/
├── lesson.html      # page source (required)
├── <key>.css        # lesson-specific styles (optional)
└── ui-<key>.js      # scenes, missions, quiz data (required if the lesson has any interaction)
```

Register the lesson in the `LESSONS` map in `lessons/build.py`:

```python
'l31': ('3-1-dh-parameters.html', ['shared/lesson.css', 'shared/lab.css', 'l31/l31.css'], {
    '/*@@JS@@*/': ['shared/ui-core.js', 'shared/kit.js', 'shared/planar-arm.js',
                   'shared/missions.js', 'shared/quiz.js', 'l31/ui-l31.js'],
}),
```

## `lesson.html` skeleton

The required pieces, in order:

1. `<html lang="en">`, a `<title>` in the form `"<n> <Title> — Kinematics Workshop"`, and a
   `<meta name="description">`. Link-preview tags are generated from these.
2. A `<style>/*@@CSS@@*/</style>` marker **(enforced)**.
3. A top bar with the brand link, section links (`<nav class="toc">`) and
   `<button class="theme-btn">` **(enforced)**.
4. `<main>`, containing:
   - `<section class="hero" id="top">`: kicker with the lesson number and part, `<h1>`, a lead
     paragraph, `hero-meta` (time, labs, missions) and `hero-list`
   - optionally `<section class="recall-sec" id="recall">` with `#recallData` JSON (see
     [data-model](../data-model.md))
   - `<section class="section" id="…">` blocks. Each one is a lab, a small interactive or prose
     (Principle II). The `id` must be lowercase kebab-case.
   - `<section class="section" id="quiz">` containing `#quizBox` and `#quizScore`
   - `<section class="section" id="finale">` with takeaways, open questions, further reading and
     a link to the next lesson
5. A `<footer>` **(enforced)**.
6. A `<script>/*@@JS@@*/</script>` marker **(enforced)**.

## Formulas

- Use `\( … \)` for inline formulas and `\[ … \]` for display formulas.
- They are rendered at build time.
- A formula that doesn't parse stops the build and the error shows the formula **(enforced)**.
- Formulas belong in `<details class="deep">` "Under the hood" blocks (Principle I). Short inline
  symbols in prose such as \(\theta_1\) are fine.

## Conditional links

`<!--if:3-2-attaching-frames.html-->…<!--/if-->` keeps the wrapped text only when that page is
published. Use it for "next lesson" links so unpublished pages are never linked **(enforced)**.

## Missions

`Missions.mount(rootSel, missions, api, { controls, scene })`, where each mission has these
fields:

| Field | Required | Meaning |
|---|---|---|
| `short` | yes | label in the mission strip |
| `title` | yes | mission heading |
| `text` | yes | goal, as HTML. It must say exactly what the criteria check |
| `controls` | no | which controls are visible: a list of ids or `'all'` |
| `bet` | no | `{ q, options[], answer(result, ctx) → index }`. A prediction made before the action |
| `action` | no | `{ label, run(api, ctx) → Promise<result> }`. Without it, criteria are checked live and the lab calls `ctl.update()` on every change |
| `criteria` | no | `[{ label, test(result, state, ctx) → bool }]` |
| `explain` | no | `(result, ctx) → html` shown after success |
| `fail` | no | `(result, ctx) → html` shown after a failed attempt |
| `hint` | no | HTML |
| `final` | no | `true` marks the free-play mission (the last one) |

## Engines

Engines are scene math: kinematics, solvers and the like.

- They live in `lessons/shared/*.js` (or the lesson folder if only one lesson uses them).
- They don't touch the DOM, so they can be `require`d from Node by the check scripts
  (Principle III).
- They export with `typeof module !== 'undefined' ? module.exports = X : root.X = X`.
- Every number a lesson's text states about an engine is asserted in that lesson's check script.

## Check script

Every lesson has `tools/lesson_<key>.js`, run by `tools/check.js`.

- It first asserts the engine numbers in Node.
- Then it plays the lesson in the browser using `tools/cdp.js`.
- It finishes with dark theme and 390 px screenshots in `shots/`.
- It exits non-zero on any failed check.
