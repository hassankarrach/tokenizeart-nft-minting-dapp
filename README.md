# TokenizeArt — Build your own NFT

Planning scaffold for the 42 TokenizeArt project, subject v1.00. No NFT contract, artwork, deployment, mint, or bonus is implemented yet.

## Proposed direction

Create a small original artwork visibly containing **42**, publish the image and metadata to IPFS, deploy an ERC-721 on a public testnet, mint the NFT, display it, and independently confirm its owner.

Proposed stack: Ethereum Sepolia, Solidity, OpenZeppelin ERC-721, ethers, and a disposable local EVM for tests. These choices reuse familiar concepts from Tokenizer while adding NFT ownership, metadata, and distributed storage. Exact compatible dependency versions will be checked and pinned during setup.

Working artwork title: **42 — First Light**. Artist login: **hkarrach**, inferred from the workspace account and to be confirmed before publishing immutable metadata. Proposed single-edition design is an implementation choice, not a subject requirement.

## Repository

- [PLAN.md](PLAN.md): decisions, phases, acceptance checks, risks, and next steps.
- [Subject](documentation/subject-v1.00.txt): full user-provided text; embedded PDF illustration is unavailable in this extraction.
- [Requirements](documentation/requirements.md): subject-to-deliverable checklist.
- `code/`: future Solidity source and behavior tests.
- `deployment/`: future compilation, deployment, verification, and public records.
- `mint/`: future mint/read/transfer instructions and tools.
- `assets/`: future original art, metadata, and provenance.
- `documentation/`: usage, architecture, security, and defense guides.

## Working rules

Use test networks and test funds. Wallet signing remains with the user. Never commit credentials, private keys, recovery phrases, dependencies, or build artifacts. GitHub is a private working copy; school submission is a separate action.

This scaffold has no installation or execution commands yet. Add commands only when they work. Completion requires public deployment **and minting**, distributed image availability, display, owner verification, and complete documentation.
