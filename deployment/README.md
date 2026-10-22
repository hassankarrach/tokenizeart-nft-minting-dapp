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
