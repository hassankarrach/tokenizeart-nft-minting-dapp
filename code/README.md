# Art42 contract

`Art42.sol` extends OpenZeppelin ERC721 and ReentrancyGuard. Collection name: `42 — TokenizeArt`; symbol: `ART42`.

- Exactly ten allowed IDs, 1–10. Any address may call `mint(tokenId)` to mint an available ID to itself. There is no wallet limit, reserved allocation, payment, or random assignment. One wallet can mint all remaining pieces; competing transactions are settled in chain order.
- Each ID can be issued once. No burn function exists. `totalMinted()` counts successful mints; `isMinted(id)` reports existence and rejects out-of-range IDs.
- Constructor takes a fixed `ipfs://<metadata-directory-CID>/` URI. A minted token resolves to `<base><id>.json`. Basic URI formatting is checked; the contract does not validate CIDs or retrieve metadata. There is no owner role, metadata setter, seizure, pause, upgrade, or withdrawal function.
- Standard ERC721 ownership, approvals, operator approvals and transfers apply. Mint authority is public; transfer authority belongs to the current holder/approved accounts.
- Safe minting checks receiving contracts. Failed callbacks revert all effects. ReentrancyGuard blocks recursive minting, including another ID. Receivers may transfer during receipt, so the final owner need not remain the initial receiver.
- Minting is nonpayable. Users pay only network gas. No money is required for local tests.

## Tooling

Use Node 24 (see root `.nvmrc`), then from the repository root:

```sh
npm ci
npm run compile
npm test
```

If using this workspace's downloaded runtime, prepend its path:

```sh
export PATH="$PWD/.tools/bin:$PATH"
npm ci
npm run compile
npm test
```

Build output: ignored `artifacts/Art42.json`, including ABI, bytecode and compiler settings. Compiler: solc 0.8.30, optimizer 200 runs, Shanghai target; OpenZeppelin 5.4.0. Tests use ethers 6.15.0 and an in-memory Ganache 7.9.2 chain; no RPC server, wallet secrets, or public network is needed. Receiver fixtures in `test/Receivers.sol` are test-only, excluded from the production compilation.

## Before public deployment

Finalize all **ten** artworks, 42 overlays and metadata; pin and verify images and metadata on IPFS. The contract permits token 10 from deployment onward, so do not deploy while its metadata is missing. Supply the real directory URI only after independently checking all ten `<id>.json` files. URI errors cannot be corrected after deployment. Pinning still requires ongoing storage availability.

No public deployment or frontend contract integration is included yet. The collection page continues to show a disabled Mint button. Tests use an explicitly fictional local URI; it is not a deployment input.

Validation: clean `npm ci`, compilation, and all seven behavior tests passed locally. Ganache uses its JavaScript fallback on Node 24 when the optional native µWS binary is unavailable; this affects local performance, not contract behavior.
