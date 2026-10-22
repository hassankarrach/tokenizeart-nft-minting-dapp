// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Art42 — ten individually selectable TokenizeArt collectibles.
/// @notice Minting is public and free; callers still pay network gas.
contract Art42 is ERC721, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 10;
    uint256 public totalMinted;
    string private _metadataBaseURI;

    error InvalidTokenId(uint256 tokenId);
    error TokenAlreadyMinted(uint256 tokenId);
    error InvalidMetadataBaseURI();

    /// @param metadataBaseURI_ Final IPFS directory URI, including its trailing slash.
    /// Metadata files must be named 1.json through 10.json. There is no URI setter.
    constructor(string memory metadataBaseURI_) ERC721(unicode"42 — TokenizeArt", "ART42") {
        bytes memory uri = bytes(metadataBaseURI_);
        if (
            uri.length <= 8 || uri[0] != "i" || uri[1] != "p" || uri[2] != "f"
                || uri[3] != "s" || uri[4] != ":" || uri[5] != "/" || uri[6] != "/"
                || uri[uri.length - 1] != "/"
        ) revert InvalidMetadataBaseURI();
        _metadataBaseURI = metadataBaseURI_;
    }

    /// @notice Mint an available token to yourself. Each ID can be issued once.
    /// @dev Effects precede the receiver callback; a rejected receipt rolls them back.
    /// The guard also prevents receivers minting additional IDs during that callback.
    function mint(uint256 tokenId) external nonReentrant {
        _validateTokenId(tokenId);
        if (_ownerOf(tokenId) != address(0)) revert TokenAlreadyMinted(tokenId);
        totalMinted += 1;
        _safeMint(msg.sender, tokenId);
    }

    /// @notice Whether an in-range token exists. Invalid IDs revert rather than appear available.
    function isMinted(uint256 tokenId) external view returns (bool) {
        _validateTokenId(tokenId);
        return _ownerOf(tokenId) != address(0);
    }

    /// @notice URI of a minted token's immutable metadata file.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return string.concat(super.tokenURI(tokenId), ".json");
    }

    function _baseURI() internal view override returns (string memory) {
        return _metadataBaseURI;
    }

    function _validateTokenId(uint256 tokenId) private pure {
        if (tokenId == 0 || tokenId > MAX_SUPPLY) revert InvalidTokenId(tokenId);
    }
}
