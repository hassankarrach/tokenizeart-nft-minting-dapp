# TokenizeArt — NFT Minting DApp

An ERC-721 NFT project exploring original artwork, IPFS storage, verifiable ownership, and a planned wallet-connected minting interface.

A ten-piece, choose-your-token collection is in development. Ten artwork/metadata drafts and a local browsing interface exist. `code/Art42.sol` implements public free ERC-721 minting for IDs 1–10, using a fixed IPFS metadata directory. Artist: **hkarrach**. Branded images and corrected metadata have been uploaded to IPFS; see [storage status](assets/ipfs-status.json). A local MetaMask deployment page is ready at `/deploy.html`. There is no public contract deployment or mint yet.

## Local contract development

Use Node 24 (`.nvmrc`):

```sh
npm ci
npm run compile
npm test
npm run prepare:deploy
```

See [code/README.md](code/README.md) for contract policy, security behavior and tooling. The website remains a local preview with minting disabled. Start it with `python3 -m http.server 8080 --directory website/dist` and open http://localhost:8080.

## Repository

- [PLAN.md](PLAN.md): decisions, phases, acceptance checks, risks, and next steps.
- [Subject](documentation/subject-v1.00.txt): full user-provided text; embedded PDF illustration is unavailable in this extraction.
- [Requirements](documentation/requirements.md): subject-to-deliverable checklist.
- `code/`: Solidity source and behavior tests.
- `deployment/`: future compilation, deployment, verification, and public records.
- `mint/`: future mint/read/transfer instructions and tools.
- `assets/`: artwork drafts, metadata, and collection inventory.
- `documentation/`: usage, architecture, security, and defense guides.
- [IPFS upload guide](documentation/storage.md): prepare the ten branded images, publish the image directory, then publish metadata.

## Working rules

Use test networks and test funds. Wallet signing remains with the user. Never commit credentials, private keys, recovery phrases, dependencies, or build artifacts. This GitHub repository is the working copy; school submission is a separate action.

Completion requires public deployment **and minting**, distributed image availability, display, owner verification, and complete documentation.
