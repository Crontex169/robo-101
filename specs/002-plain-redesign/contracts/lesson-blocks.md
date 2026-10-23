# Contract: Lesson Blocks

Authors copy these snippets from the sample lesson. Class names and structure are the contract
that `research.css`, `glossarize()` in `lessons/build.py` and the checks rely on.

## Related papers section

```html
<section class="section" id="papers" data-block="papers">
  <div class="prose">
    <h2>Related papers</h2>
    <p>Optional one-line intro.</p>

    <article class="paper" id="paper-pieper1968">
      <h3><a href="https://apps.dtic.mil/sti/pdfs/AD0680036.pdf">The Kinematics of Manipulators Under Computer Control</a></h3>
      <p class="meta"><span class="authors">D. L. Pieper</span> · <span class="venue">PhD thesis, Stanford University</span> · <span class="year">1968</span></p>
      <p class="takeaway">One sentence in our own words.</p>
      <figure class="paper-fig">…optional inline SVG… <figcaption>…</figcaption></figure>
      <details class="more"><summary>More details</summary><div class="body">…</div></details>
    </article>
  </div>
</section>
```

- Paywalled link: add `<span class="pay">(may need a subscription)</span>` after the `</a>` in h3.
- The section carries `data-block="papers"`; its top-bar link carries the same attribute and gets
  the book icon.

## Research thinking

```html
<div class="research" data-block="research">
  <h3>Short problem name</h3>
  <p>Context, 1–3 sentences.</p>
  <p class="q">The question?</p>
  <p class="think">Think about it for a minute before opening the answers.</p>
  <details class="answers"><summary>Possible answers</summary><div class="body"><ul>
    <li><strong>Idea.</strong> Why it might work.</li>
  </ul></div></details>
  <details class="actual"><summary>What was actually done</summary><div class="body">
    <p>Description, who, when, <a href="#paper-pieper1968">card link</a>.</p>
  </div></details>
</div>
```

It may stand inside any section's `.prose`, or as its own section with `data-block="research"`.

## Margin note

```html
<div class="noted">
  <p>The paragraph the note belongs to.</p>
  <aside class="mnote" aria-label="Author's note"><p>First-person note.</p></aside>
</div>
```

- The `.noted` wrapper holds exactly one paragraph and its note, paragraph first.
- On wide screens the wrapper becomes a two-column grid: the note sits in the right margin,
  top-aligned with the paragraph, and the row grows to fit the taller one, so notes never overlap
  (this replaces the float idea in research.md R5).

## Fold-outs (all blocks)

- Always `<details>` + `<summary>`; content in `<div class="body">`.
- Closed by default (no `open` attribute in source).
- `glossarize()` must not wrap terms inside `<article>` (paper cards), `<aside>` (margin notes) or
  `summary` (already skipped): a term's first mention belongs to lesson text.

## Plain-page contract (every page)

Every built page passes `tools/plain_scan.js`. See research.md R8 for the rules.
