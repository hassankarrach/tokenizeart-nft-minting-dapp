# TokenizeArt implementation plan

Prepared 2026-10-22. Planning and repository scaffold only. Read documentation/requirements.md alongside the full supplied subject before implementing.

## 1. Scope and decisions

Deliver the mandatory NFT lifecycle first: original artwork → distributed image storage → metadata → ERC-721 deployment → mint → display → ownership/transfer proof → reproducible documentation.

Proposed concept: “42 — First Light,” a single-edition artwork celebrating the beginning of the NFT project. Keep 42 visually obvious, upright and legible. Artwork direction/title can change before publication.

Proposed contract: Art42, symbol ART42, one token with ID 1, minted once in a transaction after deployment. Constructor fixes a nonzero immutable minter address and a nonempty IPFS metadata URI. Only that minter can call mint(to); it uses safe minting. No public sale, payment, royalties, proxy, later URI editing, seizure, freezing, public burn, or minter rotation. This is our small, defendable design, not a supply policy required by the subject. The user can change these proposed choices before implementation.

Why one token: the subject asks to create and mint an NFT, not build a marketplace or large collection. One edition makes uniqueness, permissions, and metadata easier to demonstrate. The graphical bonus can call the authorized mint function; its existence does not require unrestricted minting. After minting, transfers and approvals are normal ERC-721 operations. Administrative mint authority is distinct from current NFT ownership.

Metadata: name “42 — First Light”, description, image ipfs://<image-CID>, explicit artist field with the confirmed school login, and an Artist attribute for viewer compatibility. The custom artist field is a project requirement representation, not an ERC-721 standard field. Never publish placeholders or infer the school login solely from a GitHub username. hkarrach is provisional until confirmed.

Storage: pin artwork and metadata on IPFS, recording actual CIDs and bytes. The metadata URI is fixed in the contract and there is no setter; changing JSON/image bytes changes the corresponding CID. Pinning and available providers are needed for retrieval: content addressing is not an automatic permanence guarantee. GitHub copies are reproducibility backups, not a replacement for mandatory distributed storage.

Stack proposal: Solidity + pinned OpenZeppelin ERC-721, ethers + disposable local test chain, a supported Node LTS and pinned solc. Prefer the familiar compiler/test approach if compatible. Check current primary documentation and exact versions at setup; do not copy obsolete packages blindly. Sepolia is proposed for public application testing; verify network support/faucet access again at deployment time. Test funds only; user signs public writes.

## 2. Phase A — repository and requirement lock

- Preserve the provided subject verbatim with its version and text-extraction limitations.
- Maintain mandatory/bonus distinctions and a requirement-to-evidence table.
- Use the dedicated GitHub working repository hassankarrach/tokenizeart-nft-minting-dapp supplied by the user. Keep it separate from Club42 and school submission.
- Confirm school login, artwork direction/title, and proposed one-edition mint policy before irreversible publication/signing. Do independent setup work while awaiting preferences.

Exit: scaffold reviewed; requirements accounted for; proposed choices and remaining decisions visible. No claim of implementation completion.

## 3. Phase B — reproducible tooling and contract

- Select compatible supported Node, solc, OpenZeppelin, ethers, local-chain and test-runner versions; pin them and commit the lockfile.
- Put contract and tests in code/, build tooling in deployment/, and mint/read tools in mint/.
- Implement standard ERC-721 with metadata support, immutable minter, one allowed token ID and one successful mint. Ensure nonexistent-token tokenURI/ownerOf queries revert appropriately.
- Choose the simplest URI implementation: plain ERC721 with a fixed URI override is enough for one token; URIStorage is an alternative, not an automatic dependency requirement.
- Use checks/effects before _safeMint's receiver callback. Set one-time mint state before the callback, with revert restoring it on failed receipt. Avoid mutable state changes after the callback that could misrepresent ownership.
- Document callback behavior: a receiving contract can act on the received NFT during the callback, so do not assume ownerOf must still be the initial recipient afterward.

Meaningful local tests:
1. Correct name, symbol, configured minter and ERC-165/ERC-721/metadata interface support.
2. Invalid constructor inputs rejected; token does not exist before mint.
3. Unauthorized mint rejected; authorized mint emits correct Transfer and establishes ownership/balances.
4. Second mint rejected, including attempted callback reentry; no duplicate edition.
5. Zero-address recipient and nonreceiver contract rejected; mint remains retryable after failure.
6. Valid receiver succeeds; returning an invalid selector or reverting rolls back mint.
7. Exact tokenURI/metadata relationship; nonexistent token IDs rejected.
8. Owner transfer works, outsider transfer fails, approved transfer works, token approval clears after transfer.
9. Operator approval/revocation works; wrong from/zero recipient/unsafe receiver cases rejected.
10. No reachable URI mutation or privileged seizure path; review source rather than relying solely on ABI names.

Exit: clean install, compile and tests pass from a fresh clone. No wallet/public network required for local tests. Write actual npm commands into README once implemented.

## 4. Phase C — artwork, metadata and distributed storage

- Create original artwork with a clear 42; store editable source/export and describe authorship/tools/licensing honestly.
- Confirm title and school login before final metadata.
- Validate JSON fields and image MIME type/dimensions. Render the actual image and check 42 at thumbnail/full size.
- Add and recursively pin image, then create metadata referencing its real ipfs:// CID. Add and pin metadata.
- Record CIDs, file hashes, content sizes, pin method/provider, and verification date in assets/manifest.json. CID computation is not the same operation as a SHA-256 file checksum; record both correctly.
- Retrieve both files independently of the upload session/local cache, ideally through a second provider/gateway or separate node. Compare bytes/checksums and display art.
- Keep a local backup and pinning maintenance instructions. Do not promise indefinite availability without ongoing providers.

Exit: real retrievable distributed image and metadata, correct artist/name/title, no placeholder CIDs in deploy inputs.

## 5. Phase D — public testnet deployment and mint

- Recheck chosen public testnet, RPC, explorer and free faucet availability. Keep keys in the wallet; never embed pinning/API credentials in frontend source or git.
- Provide a documented MetaMask/browser-wallet deployment route or a reviewed deployment script using a user-controlled signer. A minimal wallet harness is sufficient; do not build a full bonus website first.
- Check chain ID, signer, immutable minter and finalized metadata URI; estimate fees before user signing.
- Deploy and wait for a successful receipt. Save actual address, chain/network, deployer, transaction hash, block and compiler settings in deployment/<network>.json.
- Publish/verify source on the explorer where supported, matching constructor args and compilation settings. Record honest status; deployment and verification are different actions.
- Mint token 1 through the authorized account in a distinct signed transaction; record receipt/hash and Transfer event.
- Independently read ownerOf(1), balanceOf, tokenURI and minter; resolve JSON/image and display the NFT. No marketplace indexing dependency.
- Demonstrate owner transfer to another controlled account and verify new owner; optionally demonstrate token approval/delegated transfer and revocation with appropriate safe accounts.
- Keep rehearsal deployments separate; check a submitted transaction before retrying after UI/RPC errors.

Exit: successful public deployment AND mint, correct metadata/image display, independent ownership evidence, and reproducible records. Never substitute a local test or UI success label for public evidence.

## 6. Phase E — documentation and defense

Write documentation/concept.md, architecture.md, storage.md, security.md, usage.md, local-testing.md and defense.md. Complete deployment/README.md and mint/README.md with commands that were actually exercised.

Explain ERC-20 versus ERC-721, token IDs, ownerOf versus balanceOf, NFT holder versus contract minter, token approval versus operator approval, safe receiver callbacks, immutable content versus ongoing availability, signing/gas, wallet cancellation, and why NFT ownership does not automatically convey copyright.

Run a clean-clone rehearsal: install → compile → local tests → resolve metadata/image → inspect public records → explain/demo ownership and transfer. Prepare fresh deployment/mint rehearsal if a later correction sheet requests it; that sheet is not available yet.

Exit: every mandatory requirement has concrete evidence, all documented commands work, no secrets tracked, status accurate. GitHub push is not school submission.

## 7. Phase F — optional bonuses after mandatory is complete

A. Polish the artwork. Aesthetics are evaluated qualitatively; no guarantee of bonus marks.

B. Build a minting website with wallet connect, chain/account checks, artwork/metadata display, owner read, authorized mint button, minted-state handling, fee estimate, pending/receipt/explorer feedback and cancellation/error handling. Test account/network changes and prevent duplicate submissions. Read-only viewing should work without a connected wallet where practical. Choose hosting only when needed.

C. Fully on-chain image AND metadata: prefer a separate experimental Art42OnChain contract with a compact original SVG and data:application/json metadata whose image contains all image bytes as a data URI. An IPFS URL stored on-chain does not qualify as storing the image on-chain. Decode and render from chain data without gateway access; measure deployment/runtime size and gas. Follow the chain's code-size and transaction limits. Continue publishing/pinning the mandatory image on IPFS rather than assuming this bonus removes IV.1. Clearly label which contract/token demonstrates each requirement; seek evaluator clarification if a single combined NFT is expected.

Exit: tested bonus behavior and documented costs/limitations, without destabilizing the mandatory artifact.

## 8. Risks and non-goals

- No source correction sheet: do not invent failure flags or mandatory live redeployment rules.
- Image examples were omitted by text extraction: inspect original illustrations if available; make 42 unambiguous.
- Single edition limits repeated mint demos on an existing deployment; use clean local instances or explicitly recorded testnet rehearsals.
- Artist/name/CID mistakes become permanent under the proposed immutable design: verify before deployment.
- Lost immutable minter key before mint prevents minting; after mint, current holder controls transfers. Explain this deliberate simplicity tradeoff.
- Receiver callbacks can reenter or transfer the NFT: test one-time issuance and rollback; do not overclaim safety.
- Public testnet/faucet and pinning availability can change: verify at use time.
- No marketplace, paid mint, financial value promise, ERC-20 coupling, royalty system, or DAO needed.

## 9. Current handoff

Done: subject read completely; scaffold, requirements matrix and phased plan written.
GitHub SSH authentication confirmed for hassankarrach. Repository-local commits use that username and GitHub noreply email. User created and supplied https://github.com/hassankarrach/tokenizeart-nft-minting-dapp.git; use its SSH remote for publishing.

Pending: login/art direction confirmation and all implementation/testing/storage/deployment/minting/bonus work.
Next implementation action: set up pinned tooling and implement/test the minimal one-edition ERC-721 before adding UI.

## Primary references checked while planning

- ERC-721 standard: https://eips.ethereum.org/EIPS/eip-721
- OpenZeppelin ERC-721 guide: https://docs.openzeppelin.com/contracts/5.x/erc721
- IPFS pinning/availability: https://docs.ipfs.tech/how-to/pin-files/
- Ethereum networks: https://ethereum.org/developers/docs/networks/
