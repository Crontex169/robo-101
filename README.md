# Kinematics Workshop

A free, interactive course on robot arm kinematics for people starting from zero. Each lesson is a
single self-contained web page: you read a short explanation, then try the idea in a live scene
(drag the arm, make a prediction, check the result), and finish with a quiz on common
misconceptions. Everything runs in the browser, offline, with no sign-up.

The program has seven parts: a math toolkit (M), a physics toolkit (F), then manipulators, position
and orientation, forward kinematics, inverse kinematics and the Jacobian. Each part ends with a
checkpoint. Dynamics, trajectories and control are out of scope.

## What's inside

```
site/      home page, 404 page and config.json (links and the published-lesson list)
  index.src.html, 404.src.html   page sources; site/build.py fills in links and the program state
  assets/                        styles, fonts (Inter, JetBrains Mono, KaTeX), icons, og.png
lessons/   lesson sources; lessons/build.py turns each into one HTML file in site/lessons/
  shared/  modules every lesson uses: lesson and lab styles, scene kit (kit.js), missions,
           quiz, warm-up (recall), glossary tooltips, progress, part checkpoints (check.js),
           and the planar arm engine (planar-arm.js)
  sample/  the template lesson: copy it to start a new one (never published)
  gl/      the glossary page
tools/     the check (check.js), lesson checks (lesson_*.js), the site assembler, the headless
           browser driver (cdp.js) and the build-time formula renderer
specs/     spec-kit feature specs, plans and tasks
```

## Requirements

Python 3.10+, Node.js 22+, and Chrome or Edge for the checks.

## Commands

```
python lessons/build.py all     # build every lesson into site/lessons/
python site/build.py            # build the home and 404 pages, sitemap.xml and robots.txt
python tools/assemble.py dist   # both builds, then only published pages into dist/
node tools/check.js             # the full pre-publish check (about 10 s)
node tools/lesson_sample.js     # check one lesson
node tools/og_image.js          # redraw the link-preview image
```

Open `dist/index.html` (or `site/lessons/sample.html`) straight from disk; no server is needed.

The check finds Chrome or Edge on its own. To use another browser, set `CHROME_PATH` to its
executable. `KW_CONFIG=path/to/config.json` builds against another published list; the check uses
`tools/fixtures/config.check.json` to publish the sample lesson in a test build.

## Adding a lesson

1. Copy `lessons/sample/` to `lessons/<key>/` and rename `sample.css` and `ui-sample.js`.
2. Register it in the `LESSONS` map in `lessons/build.py` (output file name, CSS, JS).
3. Write the lesson following `specs/001-site-foundation/contracts/lesson-source.md`.
4. Copy `tools/lesson_sample.js` to `tools/lesson_<key>.js`. Assert every number the text states,
   then play every mission. Call it from `tools/check.js`.
5. Add `{ "n": "<number>", "file": "lessons/<file>.html" }` to `site/config.json → PUBLISHED`
   once `node tools/check.js` passes.

Pushing to `main` runs the check in GitHub Actions and deploys `dist/` to GitHub Pages only if it
passes.

## Licenses

- Code: [MIT](LICENSE). This project is built on the code of
  [modern-robotics](https://github.com/oleg-Shipitko/modern-robotics) by Oleg Shipitko (MIT).
- Fonts: Inter and JetBrains Mono under the SIL Open Font License. KaTeX and its fonts are under
  the MIT license.
- Course text and figures are original to this project.
