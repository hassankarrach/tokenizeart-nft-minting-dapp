"""Overlay the supplied 42 logo in white on ten originals; never overwrite sources.

Requires Pillow and CairoSVG. Run from any directory:
    python3 assets/scripts/brand_artworks.py
"""
from io import BytesIO
from pathlib import Path
import hashlib
import json
import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'assets'
OUTPUT = ASSETS / 'artworks/branded'
OUTPUT.mkdir(parents=True, exist_ok=True)
LOGO_SVG = '<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->\n<svg fill="#ffffff" width="800px" height="800px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><path d="m24 12.42-4.428 4.415H24zm-4.428-4.417-4.414 4.418v4.414h4.414V12.42L24 8.003V3.575h-4.428zm-4.414 0 4.414-4.428h-4.414zM0 15.996h8.842v4.43h4.412V12.42H4.428l8.826-8.846H8.842L0 12.421z"/></svg>'
logo = Image.open(BytesIO(cairosvg.svg2png(bytestring=LOGO_SVG.encode(), output_width=800, output_height=800))).convert('RGBA')
logo = logo.crop(logo.getbbox())  # Remove the SVG's internal transparent margins.
collection = json.loads((ASSETS / 'collection.json').read_text())
for item in collection['items']:
    token_id = item['token_id']
    source = ASSETS / f'artworks/character-{token_id:02d}-v1.png'
    canvas = Image.open(source).convert('RGBA')
    width = round(canvas.width * 0.12)
    mark = logo.resize((width, round(width * logo.height / logo.width)), Image.Resampling.LANCZOS)
    margin = round(min(canvas.size) * 0.03)
    canvas.alpha_composite(mark, (margin, canvas.height - margin - mark.height))
    output = OUTPUT / f'character-{token_id:02d}-branded.png'
    canvas.save(output)
    item.update(source_artwork=str(source.relative_to(ASSETS)), source_artwork_sha256=hashlib.sha256(source.read_bytes()).hexdigest(), artwork=str(output.relative_to(ASSETS)), artwork_sha256=hashlib.sha256(output.read_bytes()).hexdigest(), artwork_bytes=output.stat().st_size, width=canvas.width, height=canvas.height)
    metadata_path = ASSETS / item['metadata']
    metadata = json.loads(metadata_path.read_text())
    metadata['image'] = '../' + item['artwork']
    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
collection['branding_overlay_pending'] = False
collection['branding'] = {'logo': 'embedded in scripts/brand_artworks.py', 'color': '#ffffff', 'logo_sha256': hashlib.sha256(LOGO_SVG.encode()).hexdigest(), 'position': 'bottom-left', 'width_fraction': 0.12, 'margin_fraction': 0.03, 'script': 'scripts/brand_artworks.py'}
collection['artwork_review']['visible_42_present'] = True
collection['artwork_review']['notes'] = 'All ten branded exports include the supplied white 42 logo at bottom-left. Original unbranded PNGs are preserved; IPFS publication remains pending.'
(ASSETS / 'collection.json').write_text(json.dumps(collection, ensure_ascii=False, indent=2) + '\n')
print('Branded all ten artworks; updated metadata paths and collection hashes.')
