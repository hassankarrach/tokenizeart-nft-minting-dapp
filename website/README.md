# TokenizeArt landing page

Buildless HTML, CSS and JavaScript. Home and collection explorer; no on-chain minting yet.

Run locally from this directory:

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. Connect Wallet requests account access through MetaMask (EIP-6963 with injected-provider fallback). It never requests signatures or transactions. Connection displays a shortened address; connecting from home opens the collection explorer. A browser with MetaMask is needed for the real connection flow.

Three duplicated artwork tracks loop vertically in alternating directions. Animation continues on hover; reduced-motion preferences disable animation. Continuous tracks use linear timing for a seamless speed at the loop boundary; card hover effects use easing.

Fonts: Manrope for headlines and DM Sans for body text, loaded from Google Fonts with local sans-serif fallbacks. Art assets are copies of the collection drafts in ../assets/artworks/.

## Collection explorer

Open `/collection.html` to browse ten reviewed artwork drafts. Search by title or visual trait, filter by rarity, sort, and select an artwork to inspect its traits. Minting is explicitly disabled until a contract exists. No blockchain ownership or mint availability is inferred from the draft catalog.

A successful MetaMask connection from home opens the collection page. Direct visits can browse without a wallet. Wallet connection on the collection page stays there.

Regenerate the public catalog after editing metadata:

```sh
python3 scripts/sync-collection.py
```

The canonical source remains `../assets/metadata/` and `../assets/collection.json`.

The collection explorer uses a viewport-height showcase: active artwork left, metadata right, and a horizontal scroll-snap artwork strip below the details. Arrow buttons and native horizontal scrolling navigate the strip; selecting a card updates the active image and traits. On smaller screens, details scroll inside their column while the page stays within the viewport.

## Layered left preview

The featured artwork container displays the fixed `assets/scene-base.png` (a copy of root `base.png`) beneath a transparent cutout from `assets/characters/`. Selecting a card updates only the foreground and labels. The collectible card imagery and NFT metadata continue to use the full original artwork. Cutouts are preserved in `../assets/ui/characters/`; see `../assets/ui/README.md`.

Idle breathing, swaying, rocking and action motions are CSS transforms of static PNGs. They pause in hidden tabs and respect reduced-motion preferences. Pointer movement adds subtle foreground parallax without moving the backdrop.

Exception: token 6 retains the original full image by user preference after the image tool rejected its extraction. All other tokens use transparent PNG cutouts.

Preview update: character cutouts are used only during the slide/blur switch. Once it finishes, the original merged artwork is shown to preserve its authored shadows. Idle animation and pointer parallax are disabled.

Current presentation: the left preview slides/blurs between full merged artwork images, with no base or cutout layers. Layering is now used in the carousel cards: a clipped campus backdrop and an overflowing transparent character, with hover translation and selected scaling/frame/plinth colors. Token 6 keeps its original full image. Card images are display-only and do not alter NFT metadata.

Token 1 video prototype: root `1.mp4` is encoded to `assets/video/character-01-intro.mp4` (H.264, yuv420p, CRF 23, faststart, no audio). Selecting token 1 plays once, then reveals the full merged artwork. Selecting it again replays; changing selection stops/removes playback. Errors fall back to the still image. Reduced-motion preference skips playback. The source video is unchanged.
