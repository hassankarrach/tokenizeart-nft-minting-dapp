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

## Remaining steps

1. Add the final readable 42 logo overlay on every piece (all ten artworks now exist).
2. Review metadata, traits, titles and provisional rarity assignments. Record honest source/provenance and tools.
3. Pin final images and metadata on IPFS; record real CIDs, hashes and independent retrieval evidence. All ten metadata files must exist before public deployment because all IDs are immediately mintable.
4. Connect the Mint button to the contract on a disposable local chain: chain/account checks, availability reads, fee estimates, pending receipts, errors and owner display. Do not present local fixtures as public evidence.
5. Recheck public testnet/RPC/faucet support and compiler settings. Deploy through the user's wallet using finalized metadata; record address, chain, compiler, transaction and block. User signs public writes.
6. Mint publicly, independently verify `ownerOf`, `tokenURI`, metadata/image display, and demonstrate transfer/approval behavior. Record actual receipts and source verification status.
7. Complete storage, security, usage, local testing and defense documentation, then rehearse from a clean clone. School submission is separate from GitHub publishing.

## Acceptance checks

The mandatory subject remains authoritative: readable 42 in artwork, distributed image storage, blockchain NFT standard, metadata with login and name/title including 42, readable source in `code/`, deployment materials, public mint, display/owner proof, and reproducible documentation. See `documentation/requirements.md` and the preserved subject.

Meaningful contract tests cover input validation, interfaces, nonexistent queries, public selection, duplicate and paid-mint rejection, all ten IDs, ownership/events, approvals/operators, valid and invalid transfers, receiver success/failure/retry, same-ID and different-ID reentry, and transfer during receipt.

Optional on-chain artwork/metadata and visual polish follow completion of the mandatory lifecycle. No production deployment, real-money sale or automatic school submission is authorized by this implementation work. Never commit private keys, credentials, dependencies or build output.
