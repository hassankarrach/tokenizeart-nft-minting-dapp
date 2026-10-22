# Artwork and metadata

- `artworks/`: ten updated 3D character PNGs, visually reviewed on 2026-10-22.
- `metadata/1.json` through `metadata/10.json`: matching local metadata drafts with confirmed artist `hkarrach`.
- `collection.json`: full inventory, current image hashes, dimensions, byte sizes and curated rarity labels.
- [Metadata guide](metadata/README.md): titles, review findings and publication steps.

All ten artworks now exist. All ten branded exports in `artworks/branded/` include the supplied 42 logo. IPFS publication remains pending. The visible 1337 building label does not replace the required 42. No contract deployment or mint is implied.

Recreate the exports with `python3 assets/scripts/brand_artworks.py` (requires Pillow and CairoSVG). The script always uses unbranded originals, preventing double overlays.
