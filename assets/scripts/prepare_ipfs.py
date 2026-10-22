"""Prepare public IPFS uploads without modifying the local artwork/metadata drafts.

Run once to prepare images, then again with --images-cid after uploading that folder.
This script does not upload files, pin content, or claim network verification.
"""
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'assets'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--images-cid', help='Bare public IPFS directory CID containing 1.png through 10.png')
args = parser.parse_args()
if args.images_cid and not re.fullmatch(r'(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,})', args.images_cid):
    parser.error('Supply a bare CID, not an ipfs:// URI, gateway URL, or directory path.')
collection = json.loads((ASSETS / 'collection.json').read_text())
assert len(collection['items']) == 10 and collection['artist'] == 'hkarrach'
assert {item['token_id'] for item in collection['items']} == set(range(1, 11))
output = ASSETS / 'ipfs-upload'
images = output / 'images'
images.mkdir(parents=True, exist_ok=True)
records = []
for item in collection['items']:
    token = item['token_id']
    source = ASSETS / item['artwork']
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    assert digest == item['artwork_sha256'], f'Artwork {token} changed: review collection hash first.'
    assert source.parent.name == 'branded', f'Token {token} does not reference branded artwork.'
    shutil.copy2(source, images / f'{token}.png')
    records.append({'token_id': token, 'file': f'{token}.png', 'sha256': digest})
if args.images_cid:
    metadata = output / 'metadata'
    metadata.mkdir(exist_ok=True)
    for item in collection['items']:
        token = item['token_id']
        data = json.loads((ASSETS / item['metadata']).read_text())
        assert data['artist'] == 'hkarrach' and '42' in data['name']
        assert {'trait_type': 'Artist', 'value': 'hkarrach'} in data['attributes']
        data['image'] = f'ipfs://{args.images_cid}/{token}.png'
        (metadata / f'{token}.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
(output / 'preparation.json').write_text(json.dumps({
    'status': 'prepared_only_not_uploaded_or_verified',
    'images_directory_cid': args.images_cid,
    'items': records,
}, indent=2) + '\n')
print(f'Upload this images folder as a PUBLIC IPFS directory: {images}')
if args.images_cid:
    print(f'Upload this metadata folder as a PUBLIC IPFS directory: {output / "metadata"}')
else:
    print('After image upload: python3 assets/scripts/prepare_ipfs.py --images-cid YOUR_REAL_IMAGES_DIRECTORY_CID')
