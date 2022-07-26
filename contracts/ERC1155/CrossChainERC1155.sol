// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ICrossChainERC1155.sol";
import "./extensions/ICrossChainERC1155MetadataURI.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@routerprotocol/router-crosstalk/contracts/RouterCrossTalk.sol";

/**
 * @dev Implementation of Router CrossTalk in the basic standard multi-token ERC-1155.
 *
 * TIP: For a detailed overview see our guide
 * https://dev.routerprotocol.com/crosstalk-library/overview
 */
contract CrossChainERC1155 is ERC1155, ICrossChainERC1155, RouterCrossTalk {
    uint256 private _crossChainGasLimit;
    uint256 private _crossChainGasPrice;
    mapping(uint256 => bytes32) public nonceToHash;

    constructor(string memory uri_, address genericHandler_)
        ERC1155(uri_)
        RouterCrossTalk(genericHandler_)
    {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC1155)
        returns (bool)
    {
        return
            interfaceId == type(ICrossChainERC1155).interfaceId ||
            interfaceId == type(ICrossChainERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice setCrossChainGasLimit Used to set CrossChainGasLimit, this can only be set by CrossChain Admin or Admins
     * @param _gasLimit Amount of gasLimit that is to be set
     */
    function _setCrossChainGasLimit(uint256 _gasLimit) internal {
        _crossChainGasLimit = _gasLimit;
    }

    /**
     * @notice fetchCrossChainGasLimit Used to fetch CrossChainGasLimit
     * @return crossChainGasLimit that is set
     */
    function fetchCrossChainGasLimit()
        external
        view
        override
        returns (uint256)
    {
        return _crossChainGasLimit;
    }

    /**
     * @notice setCrossChainGasPrice Used to set CrossChainGasPrice, this can only be set by CrossChain Admin or Admins
     * @param _gasPrice Amount of gasPrice that is to be set
     */
    function _setCrossChainGasPrice(uint256 _gasPrice) internal {
        _crossChainGasPrice = _gasPrice;
    }

    /**
     * @notice fetchCrossChainGasPrice Used to fetch CrossChainGasPrice
     * @return crossChainGasPrice that is set
     */
    function fetchCrossChainGasPrice()
        external
        view
        override
        returns (uint256)
    {
        return _crossChainGasPrice;
    }

    /**
     * @notice _sendCrossChain This is an internal function to generate a cross chain communication request
     */
    function _sendCrossChain(
        uint8 _chainID,
        address _recipient,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory _data
    ) internal returns (bool) {
        _burnBatch(msg.sender, _ids, _amounts);
        bytes4 _selector = bytes4(
            keccak256("receiveCrossChain(address,uint256[],uint256[],bytes)")
        );
        bytes memory data = abi.encode(_recipient, _ids, _amounts, _data);
        (bool success, bytes32 hash) = routerSend(
            _chainID,
            _selector,
            data,
            _crossChainGasLimit,
            _crossChainGasPrice
        );
        nonceToHash[this.fetchExecutes(hash).nonce] = hash;
        require(success == true, "unsuccessful");
        return success;
    }

    /**
     * @notice _routerSyncHandler This is an internal function to control the handling of various selectors and its corresponding
     * @param _selector Selector to interface.
     * @param _data Data to be handled.
     */
    function _routerSyncHandler(bytes4 _selector, bytes memory _data)
        internal
        virtual
        override
        returns (bool, bytes memory)
    {
        (
            address _recipient,
            uint256[] memory _ids,
            uint256[] memory _amounts,
            bytes memory data
        ) = abi.decode(_data, (address, uint256[], uint256[], bytes));
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSelector(_selector, _recipient, _ids, _amounts, data)
        );
        return (success, returnData);
    }

    /**
     * @notice receiveCrossChain Creates `_amounts` tokens of token type `_ids` to `_recipient` on the destination chain
     *
     * NOTE: It can only be called by current contract.
     *
     * @param _recipient Address of the recipient on destination chain
     * @param _ids TokenIds
     * @param _amounts Number of tokens with `_ids`
     * @param _data Additional data used to mint on destination side
     * @return bool returns true when completed
     */
    function receiveCrossChain(
        address _recipient,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory _data
    ) external isSelf returns (bool) {
        _mintBatch(_recipient, _ids, _amounts, _data);
        return true;
    }

    /**
     * @notice replayTransferCrossChain Replays the transaction if hindered by insufficient gas
     *
     * @param _nonce nonce for the transaction to be replayed
     * @param crossChainGasLimit Revised Gas Limit
     * @param crossChainGasPrice Revised Gas Price
     */
    function replayTransferCrossChain(
        uint64 _nonce,
        uint256 crossChainGasLimit,
        uint256 crossChainGasPrice
    ) public {
        routerReplay(
            nonceToHash[_nonce],
            crossChainGasLimit,
            crossChainGasPrice
        );
    }
}
