# Contract: Author Commands

All commands run from the repo root. They need Python 3.10+ and Node 22+, and the checks also
need Chrome or Edge.

| Command | Does | Exit code |
|---|---|---|
| `python lessons/build.py <key>` | Builds one lesson into `site/lessons/` | non-zero on a formula error, a missing marker, or an unknown glossary lesson/section |
| `python lessons/build.py all` | Builds every lesson, the sample included | same as above |
| `python site/build.py` | Builds `index.html`, `404.html`, `sitemap.xml` and `robots.txt` from the `*.src.html` files and `config.json` | non-zero if a `PUBLISHED` entry isn't in the program |
| `python tools/assemble.py dist` | Runs both builds, then copies only published pages and the assets into `dist/` | non-zero if a published lesson wasn't built |
| `node tools/check.js` | Runs the full pre-publish check (see [research §6](../research.md#6-check-orchestration)) and writes screenshots to `shots/` | non-zero on the first failed step, after printing `✗ <step>: <reason>` |
| `node tools/lesson_<key>.js` | Checks one lesson (engine numbers, then the browser run) | non-zero on any failed check |

## Environment variables

| Variable | Used by | Meaning |
|---|---|---|
| `CHROME_PATH` | `tools/cdp.js` | Full path to a Chromium-based browser; overrides auto-detection |
| `KW_CONFIG` | `site/build.py`, `lessons/build.py`, `tools/assemble.py` | Alternative config file. The check uses `tools/fixtures/config.check.json` |

## Output format

Each check step prints one line, `✓ <what>` or `✗ <what>: <why>`. The last line is
`OK: N checks` or `FAILED: k of N checks`.
