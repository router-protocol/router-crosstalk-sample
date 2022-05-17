//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@routerprotocol/router-crosstalk/contracts/nonupgradeable/RouterCrossTalk.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Greeter is RouterCrossTalk {
    string private greeting;
    address public owner;

    constructor(address _handler) RouterCrossTalk(_handler) {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) external isSelf {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function setLinker(address _linker) external onlyOwner {
        setLink(_linker);
    }

    function setFeesToken(address _feeToken) external onlyOwner {
        setFeeToken(_feeToken);
    }

    function setGreetingCrossChain(uint8 _chainID, string memory _greeting)
        external
        onlyOwner
        returns (bool)
    {
        bytes memory data = abi.encode(_greeting);
        bytes4 _selector = bytes4(keccak256("setGreeting(string)"));
        bool success = routerSend(_chainID, _selector, data, 100000);
        return success;
    }

    function _routerSyncHandler(bytes4 _selector, bytes memory _data)
        internal
        override
        returns (bool, bytes memory)
    {
        string memory _greeting = abi.decode(_data, (string));
        (bool success, bytes memory data) = address(this).call(
            abi.encodeWithSelector(_selector, _greeting)
        );
        return (success, data);
    }

    function recoverFeeTokens() external onlyOwner {
        address feeToken = this.fetchFeetToken();
        uint256 amount = IERC20(feeToken).balanceOf(address(this));
        IERC20(feeToken).transfer(owner, amount);
    }
}
