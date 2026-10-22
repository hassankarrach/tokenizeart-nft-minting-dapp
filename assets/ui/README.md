# Layered character previews

The collection page uses the repository-root `base.png` as its fixed campus backdrop and a separate transparent PNG for each character. Source NFT images and metadata are independent of these UI-only previews.

Nine PNGs in `characters/` (tokens 1–5 and 7–10) are generated background-removal derivatives of the matching `assets/artworks/character-NN-v1.png`. The built-in imagegen tool was used with transparent background enabled, preserving each character and its foreground props. AI extraction may introduce small edge or rendering differences; these derivatives are display assets, not replacements for the collectible artwork.

The extraction prompt for each piece follows this specification:

> Extract only the matching character and foreground props. Remove the campus, sky, pavement and ground shadows to actual alpha transparency. Preserve identity, pose, proportions, colors, lighting and fine edges. Keep the subject on a square canvas, with no added text or background.

Props retained: shark bottles/glass (#2), horse scooter (#4), frog chair (#5), toy truck (#8), and baguette (#9).

The browser adds a gentle idle transform suited to each pose, a selection entrance, and small pointer parallax. These are animated static PNGs, not skeletal or video animation. Reduced-motion preferences disable movement; tab visibility pauses idle animation. The background DOM element remains in place when the selected NFT changes, and preload request ordering prevents a slower old image from replacing the latest selection.

UI copies are served from `website/dist/assets/characters/`, with the exact fixed base at `website/dist/assets/scene-base.png`. `manifest.json` records source and cutout hashes and dimensions.

Token 6 retains its original full artwork in the preview, as requested after the image tool blocked extraction. It has no transparent cutout and no idle foreground animation. The fixed base remains underneath it.
