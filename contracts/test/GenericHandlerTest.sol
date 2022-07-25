// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@routerprotocol/router-crosstalk/contracts/interfaces/iRouterCrossTalk.sol";

contract GenericHandlerTest {
    uint64 public nonce;
    event deposit(
        uint8 chainID,
        bytes _data,
        bytes32 _hash,
        uint256 _gas,
        uint256 _gasPrice,
        address _feeToken
    );

    event ReplayEvent(
        uint8 _destChainID,
        uint64 _depositNonce,
        uint256 _gasLimit,
        uint256 _gasPrice
    );

    function fetch_chainID() external pure returns (uint8) {
        return 111;
    }

    function genericDeposit(
        uint8 _destChainID,
        bytes memory _data,
        bytes32 _hash,
        uint256 _gas,
        uint256 _gasPrice,
        address _feeToken
    ) external returns (uint64) {
        emit deposit(_destChainID, _data, _hash, _gas, _gasPrice, _feeToken);
        return ++nonce;
    }

    function replayGenericDeposit(
        uint8 _destChainID,
        uint64 _depositNonce,
        uint256 _gasLimit,
        uint256 _gasPrice
    ) external {
        emit ReplayEvent(_destChainID, _depositNonce, _gasLimit, _gasPrice);
    }

    function execute(
        address _crossTalkAddr,
        uint8 srcChainID,
        address srcAddress,
        bytes memory _data,
        bytes32 hash
    ) external {
        iRouterCrossTalk CrossTalk = iRouterCrossTalk(_crossTalkAddr);
        CrossTalk.routerSync(srcChainID, srcAddress, _data, hash);
    }

    function linkContract(
        address _interface,
        uint8 _chainID,
        address _contract
    ) external {
        iRouterCrossTalk CrossTalk = iRouterCrossTalk(_interface);
        CrossTalk.Link(_chainID, _contract);
    }

    function unlinkContract(address _interface, uint8 _chainID) external {
        iRouterCrossTalk CrossTalk = iRouterCrossTalk(_interface);
        CrossTalk.Unlink(_chainID);
    }
}
