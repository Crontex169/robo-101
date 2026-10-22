#!/usr/bin/env python3
"""Builds the site pages: fills in the SVG sprite, links and the published-lesson list from
config.json, and writes robots.txt and sitemap.xml.
Run:  python site/build.py
      KW_CONFIG=tools/fixtures/config.check.json python site/build.py   (check build)
"""
import json, os, pathlib, re, shutil, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
cfg_path = pathlib.Path(os.environ.get('KW_CONFIG') or HERE / 'config.json')
if not cfg_path.is_absolute():
    cfg_path = ROOT / cfg_path
cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
sprite = (HERE / 'assets/sprite.svg.html').read_text(encoding='utf-8')
shutil.copyfile(ROOT / 'lessons/shared/kit.js', HERE / 'assets/kit.js')  # one source for the site and the lessons

# Every published entry must exist in the program (PARTS in index.src.html), except the glossary.
if not (HERE / 'index.src.html').exists():
    sys.exit('site/index.src.html not found')
index_src = (HERE / 'index.src.html').read_text(encoding='utf-8')
parts = re.search(r'const PARTS = \[(.*?)\n\];', index_src, flags=re.S)
if not parts:
    sys.exit('index.src.html: PARTS array not found')
program = set(re.findall(r"\['([^']+)',", parts.group(1)))
published = cfg.get('PUBLISHED', [])
unknown = [p['n'] for p in published if p['n'] != 'G' and p['n'] not in program]
if unknown:
    sys.exit(f'{cfg_path.name}: published entries not in the program: {", ".join(unknown)}')

vals = {k: v for k, v in cfg.items() if isinstance(v, str)}
vals['READY_JSON'] = json.dumps({p['n']: p['file'] for p in published}, ensure_ascii=False)
site_url = vals.get('SITE_URL', '').rstrip('/')

missing = set()
for src in sorted(HERE.glob('*.src.html')):
    html = src.read_text(encoding='utf-8').replace('<!--SPRITE-->', sprite)
    def sub(m):
        val = vals.get(m.group(1), '')
        if not val:
            missing.add(m.group(1))
            return '#'
        return val
    html = re.sub(r'\{\{([A-Z_]+)\}\}', sub, html)
    out = HERE / src.name.replace('.src.html', '.html')
    out.write_text(html, encoding='utf-8')
    print(f'{out.name}: {len(html) // 1024} KB')

# robots.txt and sitemap.xml list published pages only
for p in published:
    if not (HERE / p['file']).exists():
        print(f'WARNING: published lesson {p["n"]} is not built: {p["file"]}', file=sys.stderr)
urls = [f'{site_url}/'] + [f'{site_url}/{p["file"]}' for p in published]
(HERE / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n', encoding='utf-8')
(HERE / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {site_url}/sitemap.xml\n', encoding='utf-8')
print(f'sitemap.xml: {len(urls)} URLs, robots.txt')
if missing:
    print('Links not set:', ', '.join(sorted(missing)), '- fill them in config.json', file=sys.stderr)
