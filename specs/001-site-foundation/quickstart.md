# Quickstart: Validate the Site Foundation

You'll need Windows 11 (or macOS or Linux), Python 3.10+, Node 22+, and Chrome or Edge.

## 1. Full check (covers User Stories 1–5)

```powershell
node tools/check.js
```

The final line should be `OK: N checks`. Screenshots of the home page, the sample lesson (light,
dark, 390 px) and the glossary page land in `shots/`.

## 2. Open the site from disk

```powershell
python tools/assemble.py dist
start dist/index.html
```

You should see:

- The intro, "Who is this for" and "How a lesson works" sections.
- All seven parts, with every lesson and checkpoint marked "Coming soon". None of them is clickable.
- The glossary link in the menu, leading to the empty state.
- A theme toggle that switches the theme and remembers it after a reload.
- Nothing appearing in the browser's network tab except local files.

## 3. Open the sample lesson

```powershell
python lessons/build.py sample
start site/lessons/sample.html
```

Work through it:

1. Answer the warm-up.
2. In the lab, drag the arm. The readouts and mission criteria update live.
3. Make the prediction, finish every mission, and reach free play.
4. Open "Under the hood". The formula is already typeset; view the source and confirm there's no
   KaTeX `<script>`.
5. Hover over a glossary term to see its definition.
6. Finish the quiz. Each answer shows whether it was right and why.

## 4. Publish a lesson (dry run)

1. Add `{ "n": "M.1", "file": "lessons/sample.html" }` to `site/config.json → PUBLISHED`.
2. Run `python tools/assemble.py dist`.
3. Check that `dist/lessons/sample.html` exists and that M.1 on the home page is now a link.
4. Revert the change.

## 5. Negative checks

Each change below should make `node tools/check.js` fail on the named step. Revert each one
before trying the next.

| Change | Failing step |
|---|---|
| Break the first mission's criterion in `lessons/sample/ui-sample.js` (e.g. make it always `false`) | the sample's mission step |
| Put any Cyrillic letter in `site/index.src.html` | the Cyrillic scan |
| List a lesson file that doesn't exist in `config.json` | the assemble step |
| Set `CHROME_PATH` to a bad path | browser launch, with a message naming `CHROME_PATH` |

## 6. GitHub Pages

Push to `main` and watch the "Pages" workflow. It runs `node tools/check.js` and deploys `dist/`
only if the check passes. The live URL shows the same home page as step 2.
