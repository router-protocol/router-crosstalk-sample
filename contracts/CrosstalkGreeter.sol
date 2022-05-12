//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@routerprotocol/router-crosstalk/contracts/nonupgradeable/RouterCrossTalk.sol";

contract Greeter is RouterCrossTalk {
    string private greeting;
    address private owner;

    constructor(address _handler) RouterCrossTalk(_handler) {
        owner = msg.sender;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public isSelf {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function setOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    function setLinker(address _linker) external onlyOwner {
        setLink(_linker);
    }

    function setFeesToken(address _token) external onlyOwner {
        setFeeToken(_token);
    }

    function setGreetingCrossChain(uint8 _chainID, string memory _greeting)
        external
        returns (bool)
    {
        bytes memory data = abi.encode(_greeting);
        bytes4 _interface = bytes4(keccak256("setGreeting(string)"));
        bool success = routerSend(_chainID, _interface, data, 100000);
        return success;
    }

    function _routerSyncHandler(bytes4 _selector, bytes memory _data)
        internal
        override
        returns (bool, bytes memory)
    {
        string memory _greeting = abi.decode(_data, (string));
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSelector(_selector, _greeting)
        );
        return (success, returnData);
    }
}
