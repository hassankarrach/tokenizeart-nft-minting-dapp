"""Build the public browsing catalog from the canonical local metadata drafts."""
import json
import shutil
from pathlib import Path
root = Path(__file__).resolve().parents[2]
collection = json.loads((root / 'assets/collection.json').read_text())
items = []
for entry in collection['items']:
    metadata = json.loads((root / 'assets' / entry['metadata']).read_text())
    shutil.copy2(root / 'assets' / entry['artwork'], root / 'website/dist/assets' / Path(entry['artwork']).name)
    items.append({**metadata, 'token_id': entry['token_id'], 'image': f"assets/{Path(entry['artwork']).name}"})
(root / 'website/dist/collection.json').write_text(json.dumps({'max_supply': collection['max_supply'], 'artist': collection['artist'], 'items': items}, ensure_ascii=False, indent=2) + '\n')
