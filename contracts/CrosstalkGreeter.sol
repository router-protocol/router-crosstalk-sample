//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@routerprotocol/router-crosstalk/contracts/RouterCrossTalk.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Greeter is RouterCrossTalk {
    string private greeting;
    address public owner;
    uint256 public nonce;
    mapping(uint256 => bytes32) public nonceToHash;

    constructor(address _handler) RouterCrossTalk(_handler) {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function _approveFees(address _feeToken, uint256 _value) public onlyOwner {
        approveFees(_feeToken, _value);
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

    function setGreetingCrossChain(
        uint8 _chainID,
        string memory _greeting,
        uint256 _crossChainGasLimit,
        uint256 _crossChainGasPrice
    ) external onlyOwner returns (bool) {
        nonce = nonce + 1;
        bytes memory data = abi.encode(_greeting);
        bytes4 _selector = bytes4(keccak256("setGreeting(string)"));
        (bool success, bytes32 hash) = routerSend(
            _chainID,
            _selector,
            data,
            _crossChainGasLimit,
            _crossChainGasPrice
        );
        nonceToHash[nonce] = hash;
        require(success == true, "unsuccessful");
        return success;
    }

    function replaySetGreetingCrossChain(
        uint256 _nonce,
        uint256 _crossChainGasLimit,
        uint256 _crossChainGasPrice
    ) external onlyOwner {
        routerReplay(
            nonceToHash[_nonce],
            _crossChainGasLimit,
            _crossChainGasPrice
        );
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
        address feeToken = this.fetchFeeToken();
        uint256 amount = IERC20(feeToken).balanceOf(address(this));
        IERC20(feeToken).transfer(owner, amount);
    }
}
