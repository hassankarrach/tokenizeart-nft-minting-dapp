# Publishing the collection to IPFS

We publish the final branded PNGs and JSON metadata to public IPFS. UI cutouts, the base image and intro videos are not required for this static NFT collection. Current storage status remains local-only until uploads and independent retrieval are verified.

## 1. Prepare the ten images

From the repository root:

```sh
python3 assets/scripts/prepare_ipfs.py
```

This copies the reviewed `assets/artworks/branded/` files to `assets/ipfs-upload/images/1.png` through `10.png`, checking source hashes. It does not edit source artwork or draft metadata. The generated upload directory is ignored by Git because it duplicates tracked artwork.

## 2. Upload the images directory

Use a public IPFS pinning service such as [Pinata](https://app.pinata.cloud/). Select **public IPFS**, then upload the **images folder as a directory**, not a ZIP and not ten unrelated uploads. A provider's organizational group is not necessarily an IPFS directory. Save the returned directory CID and confirm that `<CID>/1.png` and `<CID>/10.png` are real paths; a wrapper folder may change the root path.

Use the dashboard's own gateway link to open each image. Check all ten for readable 42, correct appearance and token mapping. Do not use private storage or URLs that need account cookies/access tokens as the NFT image location.

Provider UI and plan limits change; follow current [upload documentation](https://docs.pinata.cloud/files/uploading-files) and confirm folder upload is available for the selected plan. Account creation does not guarantee that every feature is free. IPFS also documents a [pinning-service workflow](https://docs.ipfs.tech/quickstart/pin/).

## 3. Build the final metadata

Replace the example argument below with the actual image directory CID:

```sh
python3 assets/scripts/prepare_ipfs.py --images-cid YOUR_REAL_IMAGES_DIRECTORY_CID
```

Upload only `assets/ipfs-upload/metadata/`, which now contains `1.json` through `10.json`. Each JSON references `ipfs://<images-directory-CID>/<token-id>.png` and includes the confirmed artist `hkarrach`. Review the names, descriptions, traits and editorial rarity labels before upload. The script validates basic CID syntax but does not prove the CID exists or resolves.

## 4. Upload the metadata directory

Upload `metadata/` as another public IPFS directory. Save its separate CID. Open `<metadata-CID>/1.json` through `10.json` and follow each `image` URI to verify the corresponding branded PNG. Do not upload the whole assets directory or include the metadata README as a token.

The contract constructor receives:

```text
ipfs://<metadata-directory-CID>/
```

The trailing `/` is required. `tokenURI(1)` becomes `ipfs://<metadata-directory-CID>/1.json`. Use the metadata directory CID, not the images CID or an individual JSON CID. The deployed contract has no URI setter, so verify the real files before deployment.

## 5. Save evidence and keep content pinned

Record both CIDs, provider/pin status, file hashes and verification date. Download all ten JSON and PNG files through a separate public gateway/node, compare bytes with local files, and display the artwork. A gateway failure can be a gateway/rate-limit problem; test through another provider rather than immediately altering content.

Keep the local originals and maintain at least one active pin; a second independent pin is useful redundancy. A CID identifies content but does not guarantee continued hosting. See [IPFS persistence](https://docs.ipfs.tech/concepts/persistence/). Changing a file changes its CID and the containing directory CID. SHA-256 file hashes are recorded separately and are not interchangeable with IPFS CIDs.

No uploads have been performed by the preparation script. Share the image directory CID after step 2 so we can verify it and prepare/review the metadata before the second upload.

## Current uploaded directory layout

The user uploaded the `ipfs-upload` wrapper, so the image paths include `/images/`. Image #1 was confirmed to display in the user’s browser. To reproduce the prepared metadata:

```sh
python3 assets/scripts/prepare_ipfs.py --images-cid bafybeigubjamznw3cys7nnwrq5sclsxo73n6im3vf6ax4lwpkambolapju --images-path images
```

Upload **only** the generated `assets/ipfs-upload/metadata/` folder next. The image CID is not the metadata CID.
