# TokenizeArt implementation plan

Updated 2026-10-22. The user selected a **10-piece, choose-your-token collection**, replacing the initial single-edition proposal. Confirmed school login: **hkarrach**.

## Current implementation

- Ten updated playful campus character artworks in `assets/artworks/`; visually reviewed with matching metadata.
- Ten draft metadata files with confirmed artist, visual traits and provisional editorial rarity tiers. `assets/collection.json` inventories all ten reviewed files.
- Local home and collection pages in `website/`, with MetaMask connection, artwork selection, filters and carousel. Minting remains disabled pending integration.
- `code/Art42.sol`: OpenZeppelin ERC721, IDs 1–10, public free mint-to-caller, immutable metadata base, safe receivers and guarded mint callbacks.
- Pinned compilation and local behavior tests at repository root. See `code/README.md` for architecture, commands and test results from the current run.

## Contract policy

Anyone may select and mint an available ID. One mint per ID, no per-wallet limit. A wallet can mint all ten; there is no owner reserve or guaranteed allocation. Transactions competing for an ID are resolved in chain order. Minting is nonpayable; public users still pay gas. Standard approvals and transfers remain available after minting.

Metadata comes from a fixed `ipfs://<directory-CID>/` base with files `1.json` through `10.json`. No setter, owner privileges, proxy, sale, royalties, burn, pause, or forced transfer. Constructor validates the URI scheme/trailing slash but cannot verify actual content or availability. Rejected safe receipts roll back issuance; callback minting is guarded. A receiver can transfer an NFT during the callback.

## IPFS uploads and deployment handoff

- All ten final PNGs have a white readable 42 overlay; originals are preserved. Branded exports and hashes are recorded in `assets/collection.json`.
- Image root CID: `bafybeigubjamznw3cys7nnwrq5sclsxo73n6im3vf6ax4lwpkambolapju`. The uploaded root contains an `images/` subfolder: token 1 is `ipfs://bafybeigubjamznw3cys7nnwrq5sclsxo73n6im3vf6ax4lwpkambolapju/images/1.png`.
- Corrected metadata CID: `bafybeia33nhwz2g4fut2iatgrsdzgbcg7pg5qh7ow7ry7gsp4aoq2s4ylu`, with direct `1.json` through `10.json` paths. The earlier `bafybeib6lyn3qw7ailwqwiq6r2ncwiuoexot4uoyytp4ls5ry7iusrcxai` upload used local image references and is superseded; do not deploy with it.
- Fixed constructor base URI: `ipfs://bafybeia33nhwz2g4fut2iatgrsdzgbcg7pg5qh7ow7ry7gsp4aoq2s4ylu/` (trailing slash required).
- User confirmed image #1 displays and pasted the corrected remote #1 JSON. Independent remote reads returned HTTP 403 from this environment; all-file retrieval/hash verification remains pending. Evidence/status: `assets/ipfs-status.json`. Keep both uploads pinned.
- Recreate upload metadata: `python3 assets/scripts/prepare_ipfs.py --images-cid bafybeigubjamznw3cys7nnwrq5sclsxo73n6im3vf6ax4lwpkambolapju --images-path images`. Generated `assets/ipfs-upload/` is ignored by Git; canonical local drafts remain in `assets/metadata/`.
- Sepolia browser deployment page is implemented at `website/dist/deploy.html`. Build with `npm run prepare:deploy`; start locally with `python3 -m http.server 8080 --directory website/dist` and visit http://localhost:8080/deploy.html.
- The page uses local ethers, permits chain 11155111 only, connects MetaMask, estimates gas, requests user signing, saves the broadcast hash, recovers receipts, verifies contract identity, and downloads a deployment record. Source-verification Standard JSON Input is included in `website/dist/deployment/`.
- Validation passed: seven contract tests; exact recompilation of verification input; deployment-page flow checks using a disposable in-memory chain, including wrong-chain rejection, estimate-only behavior, receipt recovery and duplicate prevention. These are tests, not a public deployment.
- **No Sepolia deployment or public mint has been completed.** No contract address or public transaction hash exists in the project yet. User signs all public writes through MetaMask; no private key is needed in source/chat.

## Current UI

Full merged NFT artworks switch with slide/blur transitions in the left preview. The carousel cards use the campus base plus nine transparent cutouts, varied diagonal hover overlap and selected scaling/colors. Token 6 retains its original full image at the user's request after imagegen rejected extraction.

Tokens 1–3 have encoded MP4 entrance videos. Selecting one plays once, then reveals its merged artwork; reselecting replays, changing selection cancels. Reduced-motion preferences skip playback. Remaining videos are on standby, not required before deployment.

## Next session: exact starting point

1. Open http://localhost:8080/deploy.html; restart the static server if needed. Review all ten metadata/image paths before immutable deployment. Use the corrected URI above.
2. Connect MetaMask, switch to Ethereum Sepolia, obtain free Sepolia test ETH if necessary, and estimate deployment. The user clicks Deploy and signs in MetaMask.
3. If a hash already exists in the browser, use **Check saved transaction** before submitting again. After success download `sepolia-deployment.json`, save it under `deployment/`, and record the address, transaction, chain and block. Verify source on the explorer separately.
4. Wire the collection Mint button to that actual testnet contract: account/chain validation, on-chain availability and ownership reads, fee estimate, signed mint transaction, pending/success/rejection/revert feedback, and duplicate-submission protection. The user prefers testing against the public testnet rather than a separate local UI deployment milestone.
5. Mint publicly, retrieve `ownerOf` and `tokenURI`, display the matching IPFS artwork, and demonstrate transfer/approval behavior with controlled wallets. Save real receipts and owner evidence.
6. Complete architecture/security/usage/defense documentation and requirement evidence. Rehearse from a fresh clone. School submission remains separate from GitHub.

## Acceptance checks

The mandatory subject remains authoritative: readable 42 in artwork, distributed image storage, blockchain NFT standard, metadata with login and name/title including 42, readable source in `code/`, deployment materials, public mint, display/owner proof, and reproducible documentation. See `documentation/requirements.md` and the preserved subject.

Meaningful contract tests cover input validation, interfaces, nonexistent queries, public selection, duplicate and paid-mint rejection, all ten IDs, ownership/events, approvals/operators, valid and invalid transfers, receiver success/failure/retry, same-ID and different-ID reentry, and transfer during receipt.

Bonuses: artwork quality is qualitative; the graphical website bonus needs working real minting; fully on-chain image AND metadata is not implemented and must not be claimed. The current chosen architecture stores fixed IPFS references. Sepolia deployment is authorized preparation with user wallet signing; mainnet deployment, real-money sale and automatic school submission are outside this work. Never commit private keys, credentials, dependencies or build output.
