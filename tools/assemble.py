#!/usr/bin/env python3
"""Builds the site into a folder ready to publish: the home page, glossary, 404, assets and only
the lessons on the published list (config.json, PUBLISHED). Then checks the result: every internal
link must resolve and no text file may contain Cyrillic characters.
  python tools/assemble.py dist
  KW_CONFIG=tools/fixtures/config.check.json python tools/assemble.py dist-check   (check build)
"""
import html.parser, json, os, pathlib, shutil, subprocess, sys

root = pathlib.Path(__file__).resolve().parent.parent
dist = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'dist').resolve()
cfg_path = pathlib.Path(os.environ.get('KW_CONFIG') or root / 'site' / 'config.json')
if not cfg_path.is_absolute():
    cfg_path = root / cfg_path
for script in ('lessons/build.py', 'site/build.py'):
    r = subprocess.run([sys.executable, str(root / script)] + (['all'] if script.startswith('lessons') else []), capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sys.exit(f'{script} failed:\n{r.stderr.strip()}')
site = root / 'site'
cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
pub = cfg.get('PUBLISHED', [])
if dist.exists():
    shutil.rmtree(dist)
dist.mkdir(parents=True)
for f in ['index.html', '404.html', 'robots.txt', 'sitemap.xml']:
    shutil.copy2(site / f, dist / f)
shutil.copytree(site / 'assets', dist / 'assets', ignore=shutil.ignore_patterns('sprite.svg.html', '.*'))
(dist / 'lessons').mkdir()
for p in pub:
    src = site / p['file']
    if not src.exists():
        sys.exit(f'Published page {p["n"]} is not built: {src.relative_to(root)}')
    shutil.copy2(src, dist / p['file'])

# Internal links: every href/src in the published HTML must point to a file in the folder.
class Links(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []
    def handle_starttag(self, tag, attrs):
        self.refs += [v for k, v in attrs if k in ('href', 'src') and v]
broken = []
for page in dist.rglob('*.html'):
    parser = Links(); parser.feed(page.read_text(encoding='utf-8'))
    for ref in parser.refs:
        if ref.startswith(('http:', 'https:', 'mailto:', 'data:', 'javascript:', '#')):
            continue
        target = (page.parent / ref.split('#')[0].split('?')[0]).resolve()
        if not target.exists():
            broken.append(f'{page.relative_to(dist)} → {ref}')
if broken:
    sys.exit('Broken internal links:\n  ' + '\n  '.join(sorted(set(broken))))

# No Cyrillic anywhere in the published text files (leftovers from the reference site).
# Vendored KaTeX styles are third-party and legitimately mention Cyrillic glyphs, so they're skipped.
cyr = []
for f in dist.rglob('*'):
    if 'katex' not in f.parts and f.suffix in ('.html', '.css', '.js', '.json', '.xml', '.txt', '.svg'):
        for i, line in enumerate(f.read_text(encoding='utf-8').split('\n'), 1):
            if any(0x400 <= ord(ch) <= 0x4ff for ch in line):
                cyr.append(f'{f.relative_to(dist)}:{i}')
if cyr:
    sys.exit('Cyrillic text found:\n  ' + '\n  '.join(cyr[:20]))

files = [x for x in dist.rglob('*') if x.is_file()]
print(f'{dist.name}/: {len(files)} files, {sum(x.stat().st_size for x in files) / 1e6:.1f} MB, published pages: {len(pub)}')
