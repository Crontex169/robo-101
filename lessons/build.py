#!/usr/bin/env python3
"""Builds a lesson into one self-contained HTML file.
Run: python lessons/build.py sample   (or gl, or all)
Output goes to site/lessons/. KW_CONFIG=path/to/config.json builds against another published list
(the check build uses tools/fixtures/config.check.json).
"""
import json, os, pathlib, re, subprocess, sys
root = pathlib.Path(__file__).resolve().parent
LESSONS = {
    # lesson: (output file, css files, {marker: js files})
    'sample': ('sample.html', ['shared/lesson.css', 'shared/lab.css', 'shared/research.css', 'sample/sample.css'], {
        '/*@@JS@@*/': ['shared/ui-core.js', 'shared/kit.js', 'shared/planar-arm.js', 'shared/missions.js', 'shared/quiz.js', 'sample/ui-sample.js'],
    }),
    'm1': ('m-1-vectors-and-frames.html', ['shared/lesson.css', 'shared/lab.css', 'shared/research.css', 'm1/m1.css'], {
        '/*@@JS@@*/': ['shared/ui-core.js', 'shared/kit.js', 'shared/vec.js', 'shared/missions.js', 'shared/quiz.js', 'm1/ui-m1.js'],
    }),
    # glossary: every published term from shared/glossary.json
    'gl': ('glossary.html', ['shared/lesson.css', 'gl/gl.css'], {
        '/*@@JS@@*/': ['shared/ui-core.js', 'gl/ui-gl.js'],
    }),
}
cfg_path = pathlib.Path(os.environ.get('KW_CONFIG') or root.parent / 'site' / 'config.json')
if not cfg_path.is_absolute():
    cfg_path = root.parent / cfg_path
CFG = json.loads(cfg_path.read_text(encoding='utf-8'))
PUB = {pathlib.Path(p['file']).name for p in CFG.get('PUBLISHED', [])}
SITE_NAME = 'Kinematics Workshop'
def only_published(page):
    """A <!--if:3-2-attaching-frames.html-->...<!--/if--> block stays only if that page is published,
    so a lesson never links to a page that isn't live."""
    out = re.sub(r'<!--if:([\w.-]+\.html)-->(.*?)<!--/if-->', lambda m: m.group(2) if m.group(1) in PUB else '', page, flags=re.S)
    assert '<!--if:' not in out and '<!--/if-->' not in out, 'unclosed <!--if:...--> block'
    return out
SITE_URL = CFG.get('SITE_URL', '').rstrip('/')
def add_og(page, name):
    """Link previews for messengers and social networks: title and description come from the lesson."""
    if 'og:title' in page or not SITE_URL:
        return page
    t = re.search(r'<title>(.*?)</title>', page, flags=re.S)
    d = re.search(r'<meta name="description" content="([^"]*)">', page)
    if not t or not d:
        return page
    title = t.group(1).strip()
    url = f'{SITE_URL}/lessons/{name}'
    tags = (f'<meta property="og:type" content="article">\n<meta property="og:site_name" content="{SITE_NAME}">\n'
            f'<meta property="og:title" content="{title}">\n<meta property="og:description" content="{d.group(1)}">\n'
            f'<meta property="og:url" content="{url}">\n<meta property="og:image" content="{SITE_URL}/assets/og.png">\n'
            f'<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">\n'
            f'<meta property="og:locale" content="en_US">\n<meta name="twitter:card" content="summary_large_image">\n'
            f'<link rel="canonical" href="{url}">\n')
    return page.replace(d.group(0), d.group(0) + '\n' + tags, 1)
def add_shared(page):
    """Progress in the browser (progress.js), the warm-up (recall.js) and glossary tooltips (glossary.js)."""
    js = '\n'.join((root / 'shared' / f).read_text(encoding='utf-8') for f in ('progress.js', 'recall.js', 'glossary.js'))
    assert '</script' not in js
    return page.replace('</body>', f'<script>\n{js}</script>\n</body>', 1)
# ---------- Glossary: a definition tooltip at a term's first mention (shared/glossary.*) ----------
GLOSSARY = json.loads((root / 'shared/glossary.json').read_text(encoding='utf-8'))
# article = paper cards, aside = margin notes: a term's first mention belongs to the lesson text
SKIP_TAGS = {'a', 'h1', 'h2', 'h3', 'h4', 'button', 'label', 'code', 'pre', 'script', 'style', 'summary', 'svg', 'canvas', 'select', 'textarea', 'figcaption', 'article', 'aside'}
_gl_info = None
def section_titles(key):
    src = (root / key / 'lesson.html').read_text(encoding='utf-8')
    return {m.group(1): re.sub(r'<[^>]+>', '', h.group(1)).strip()
            for m in re.finditer(r'<section[^>]*\bid="([a-z][a-zA-Z0-9-]*)"[^>]*>(.*?)</section>', src, flags=re.S)
            for h in [re.search(r'<h2[^>]*>(.*?)</h2>', m.group(2), flags=re.S)] if h}
def gl_info():
    """For each term: the lesson that introduces it, its file and section title. Unknown lessons or
    sections stop the build."""
    global _gl_info
    if _gl_info is None:
        _gl_info, titles = {}, {}
        for g in GLOSSARY:
            if g['l'] not in LESSONS:
                sys.exit(f'glossary.json: term "{g["id"]}" points to unknown lesson "{g["l"]}"')
            name = LESSONS[g['l']][0]
            if g['l'] not in titles:
                titles[g['l']] = section_titles(g['l'])
            if g['sec'] not in titles[g['l']]:
                sys.exit(f'glossary.json: term "{g["id"]}" points to unknown section "{g["sec"]}" in lesson "{g["l"]}"')
            bits = name[:-5].split('-')  # '3-1-dh-parameters.html' -> '3.1', 'm-2-trigonometry.html' -> 'M.2'
            n = f'{bits[0]}.{bits[1]}'.upper() if len(bits) > 1 and bits[1].isdigit() else bits[0]
            _gl_info[g['id']] = {'t': g['t'], 'd': g['d'], 'k': g['l'], 'n': n, 'file': name,
                                 'href': f"{name}#{g['sec']}", 'st': titles[g['l']][g['sec']]}
    return _gl_info
def glossarize(page, key):
    """The first mention of each term in lesson text (paragraphs and lists inside sections, not in
    headings, links, formulas or buttons) is wrapped in <span class="gl">; data for the terms found
    is embedded in the lesson as JSON."""
    a, b = page.find('<main>'), page.find('</main>')
    if a < 0 or b < 0:
        return page
    pats = sorted(((g, re.compile(r'(?<![\w-])(?:' + g['a'].replace(' ', r'(?:\s|&nbsp;)+') + r')(?![\w-])', re.I))
                   for g in GLOSSARY if not g.get('only') or key in g['only']), key=lambda x: -len(x[0]['a']))
    used, out, section_ok, prose, skip, katex = {}, [], False, 0, 0, 0
    for part in re.split(r'(<[^>]+>)', page[a:b]):
        if part.startswith('<'):
            m = re.match(r'<(/?)([a-zA-Z0-9]+)', part)
            if m:
                close, tag = m.group(1) == '/', m.group(2).lower()
                if tag == 'section':
                    section_ok = not close and 'class="section' in part
                elif katex:
                    katex += -1 if (close and tag == 'span') else 1 if (tag == 'span' and not part.endswith('/>')) else 0
                elif tag == 'span' and not close and 'katex' in part:
                    katex = 1
                elif tag in ('p', 'li'):
                    prose += -1 if close else 1
                elif tag in SKIP_TAGS:
                    skip += -1 if close else 1
            out.append(part)
            continue
        if not (section_ok and prose > 0 and skip == 0 and katex == 0) or not part.strip():
            out.append(part)
            continue
        spans = []
        for g, rx in pats:
            if g['id'] in used:
                continue
            for m in rx.finditer(part):
                if all(m.end() <= x or m.start() >= y for x, y, _ in spans):
                    spans.append((m.start(), m.end(), g['id'])); used[g['id']] = True
                    break
        for x, y, gid in sorted(spans, reverse=True):
            part = part[:x] + f'<span class="gl" data-gl="{gid}" tabindex="0">{part[x:y]}</span>' + part[y:]
        out.append(part)
    if not used:
        return page
    info = gl_info()
    data = {gid: {**info[gid], 'here': info[gid]['k'] == key} for gid in used}
    tag = '<script type="application/json" id="glData">' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + '</script>\n'
    return page[:a] + ''.join(out) + tag + page[b:]
def build(key):
    name, css_files, js_map = LESSONS[key]
    html = only_published((root / key / 'lesson.html').read_text(encoding='utf-8'))
    if '\\(' in html or '\\[' in html:  # KaTeX formulas are rendered into the HTML now; the browser gets only KaTeX's styles and math fonts
        r = subprocess.run(['node', str(root.parent / 'tools/katex_render.js'), key], input=html, capture_output=True, text=True, encoding='utf-8')
        if r.returncode:
            sys.exit(r.stderr.strip())
        html = r.stdout
        html = html.replace('</head>', '<link rel="stylesheet" href="../assets/katex/katex.min.css">\n</head>', 1)
    if key != 'gl':
        html = glossarize(html, key)
    else:  # only terms whose lesson is published
        info = gl_info()
        terms = [{**info[g['id']], 'id': g['id']} for g in GLOSSARY if info[g['id']]['file'] in PUB]
        html = html.replace('@@GLOSSARY_JSON@@', json.dumps(terms, ensure_ascii=False).replace('</', '<\\/'))
    css = '\n'.join((root / f).read_text(encoding='utf-8') for f in css_files + ['shared/recall.css', 'shared/glossary.css'])
    assert '/*@@CSS@@*/' in html, f'{key}: no /*@@CSS@@*/ marker'
    html = html.replace('/*@@CSS@@*/', css)
    for marker, files in js_map.items():
        js = '\n'.join((root / f).read_text(encoding='utf-8') for f in files)
        assert '</script' not in js, 'JS must not contain a closing script tag'
        assert marker in html, f'{key}: no {marker} marker'
        html = html.replace(marker, js)
    html = add_og(html, name)
    if key != 'gl':  # the way to the glossary: a top-bar link (wide screens) and the footer
        assert '<button class="theme-btn"' in html and '</footer>' in html, f'{key}: top bar theme button or footer missing'
        html = html.replace('<button class="theme-btn"', '<a class="topbar-gl" href="glossary.html">Glossary</a>\n    <button class="theme-btn"', 1)
        html = html.replace('</footer>', '  <p class="foot-gl"><a href="glossary.html">Course glossary</a>: terms with definitions and links to lessons.</p>\n</footer>', 1)
    html = add_shared(html)
    out = root.parent / 'site' / 'lessons' / name
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print(f'OK {out.relative_to(root.parent)} ({out.stat().st_size/1024:.0f} KB)')
if __name__ == '__main__':
    keys = list(LESSONS) if (len(sys.argv) > 1 and sys.argv[1] == 'all') else [sys.argv[1] if len(sys.argv) > 1 else 'sample']
    for k in keys:
        if k not in LESSONS:
            sys.exit(f'unknown lesson "{k}"; known: {", ".join(LESSONS)}')
        if not (root / k / 'lesson.html').exists():
            print(f'- {k}: no lesson.html yet, skipping'); continue
        build(k)
