# Compilation and future deployment

From the repository root with Node 24:

```sh
npm ci
npm run compile
npm test
```

`compile.mjs` writes `artifacts/Art42.json` (ignored): ABI, creation/runtime bytecode, solc version and compiler settings. Compilation uses pinned solc 0.8.30 and OpenZeppelin 5.4.0, Shanghai EVM, optimizer enabled with 200 runs.

No public deployment script, wallet transaction, deployed address or explorer verification exists yet. Tests deploy only to a disposable in-memory chain. All ten artwork and metadata files must be finalized and independently retrievable on IPFS before a public deployment. Constructor input is the final metadata directory URI ending in `/`; token 1 resolves to `<base>1.json`. This URI cannot be changed later.

Next: frontend local-chain integration, followed by user-signed testnet deployment and recorded chain ID, address, constructor input, transaction receipt and compiler/source verification evidence.

## Deploy through MetaMask on Sepolia

Prepare the browser bundle from the pinned compiler and current IPFS record:

```sh
npm run prepare:deploy
python3 -m http.server 8080 --directory website/dist
```

Open http://localhost:8080/deploy.html in a MetaMask-enabled browser. The page loads ethers locally; it never receives wallet secrets. Connect, select Ethereum Sepolia (chain 11155111), and estimate deployment. Fund the wallet with Sepolia test ETH through a faucet linked from https://ethereum.org/developers/docs/networks/#sepolia if needed. Do not buy or use mainnet ETH.

Review all ten metadata links and their image references. Token 1's corrected JSON was confirmed by the user; independent all-file byte verification remains pending in `assets/ipfs-status.json`. The URI in the prepared artifact is fixed to the corrected metadata directory, not the superseded upload.

Click Deploy and review/sign the transaction in MetaMask. The app rechecks chain/account, estimates gas and provides a buffer, then stores the broadcast hash in localStorage. It checks the receipt, recorded transaction payload, deployed bytecode existence, collection name and supply. The contract has no deployer privileges. Deployment does **not** mint an NFT.

After confirmation download `sepolia-deployment.json` and put it in `deployment/`. If receipt lookup times out or the tab closes, use Check saved transaction before retrying; the app blocks new deployment while a saved hash is unresolved or confirmed. A pending, replaced or dropped transaction needs explicit inspection in the explorer/wallet. Local browser storage is recovery assistance, not the repository's final evidence.

The page also provides `deployment/verification-input.json` for explorer Standard JSON Input source verification. Compiler is shown in the artifact, contract path is `code/Art42.sol:Art42`, constructor argument is the shown base URI. Source verification is separate from deployment.

The generated browser artifact, local ethers dependency/license, and verification input are in `website/dist/deployment/`; regenerate them when contract source or configuration changes. No public transaction has been sent by preparing these files.
