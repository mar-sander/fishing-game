"""正本のHTML/CSS/JSから、同一コードの単体プレビューを生成します。"""
from pathlib import Path
import hashlib, json, re

root = Path(__file__).resolve().parents[1]
page = (root / 'page.template.html').read_text()
page = page.replace('<!-- SCENE -->', (root / 'scene.svg').read_text())
(root / 'index.html').write_text(page)
preview = page.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + (root / 'style.css').read_text() + '\n</style>')
for name in ['engine.js', 'scene.js', 'audio.js', 'app.js']:
    preview = preview.replace(f'<script src="{name}"></script>', '<script>\n' + (root / name).read_text() + '\n</script>')
(root / 'FISHING_DUEL_FA2_Preview.html').write_text(preview)
files = ['index.html', 'style.css', 'engine.js', 'scene.js', 'audio.js', 'app.js', 'scene.svg', 'page.template.html', 'FISHING_DUEL_FA2_Preview.html']
(root / 'SOURCE_HASHES.json').write_text(json.dumps({name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in files}, indent=2)+'\n')
print('Built index.html + self-contained preview; recorded SHA-256.')
