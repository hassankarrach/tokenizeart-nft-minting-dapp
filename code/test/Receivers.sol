// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
interface IArt42 {
    function mint(uint256 id) external;
    function transferFrom(address from, address to, uint256 id) external;
}
contract NonReceiver {
    function claim(address art, uint256 id) external { IArt42(art).mint(id); }
}
contract TestReceiver is IERC721Receiver {
    uint256 public mode;
    bool public reentrySucceeded;
    address public destination;
    function configure(uint256 mode_, address destination_) external {
        mode = mode_; destination = destination_;
    }
    function claim(address art, uint256 id) external { IArt42(art).mint(id); }
    function onERC721Received(address, address, uint256 id, bytes calldata)
        external returns (bytes4)
    {
        if (mode == 1) return bytes4(0);
        if (mode == 2) revert("Receipt refused");
        if (mode == 3 || mode == 4) {
            (reentrySucceeded,) = msg.sender.call(
                abi.encodeCall(IArt42.mint, (mode == 3 ? id : id + 1))
            );
        }
        if (mode == 5) IArt42(msg.sender).transferFrom(address(this), destination, id);
        return IERC721Receiver.onERC721Received.selector;
    }
}
