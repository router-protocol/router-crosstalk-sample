//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@routerprotocol/router-crosstalk/contracts/RouterCrossTalk.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract CERC1155 is ERC1155, RouterCrossTalk {
    address public owner;
    uint256 private _crossChainGasLimit;
    uint256 private _crossChainGasPrice;
    mapping(uint256 => bytes32) public nonceToHash;

    constructor(string memory uri_, address genericHandler_)
        ERC1155(uri_)
        RouterCrossTalk(genericHandler_)
    {
        owner = msg.sender;
        uint256[] memory ids = new uint256[](3);
        ids[0] = 1;
        ids[1] = 2;
        ids[2] = 3;
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 5;
        amounts[1] = 5;
        amounts[2] = 5;
        _mintBatch(msg.sender, ids, amounts, "");
        //_crossChainGasLimit = 10000;
        //_crossChainGasPrice = 10000000000;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function mint(
        address _to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public {
        _mintBatch(_to, ids, amounts, "");
    }

    function setLinker(address _linker) public onlyOwner {
        setLink(_linker);
    }

    function _approveFees(address _feeToken, uint256 amount) public onlyOwner {
        approveFees(_feeToken, amount);
    }

    function setFeesToken(address _feeToken) public onlyOwner {
        setFeeToken(_feeToken);
    }

    /**
     * @notice setCrossChainGasLimit Used to set CrossChainGasLimit, this can only be set by CrossChain Admin or Admins
     * @param _gasLimit Amount of gasLimit that is to be set
     */
    function setCrossChainGasLimit(uint256 _gasLimit) public onlyOwner {
        _crossChainGasLimit = _gasLimit;
    }

    /**
     * @notice fetchCrossChainGasLimit Used to fetch CrossChainGasLimit
     * @return crossChainGasLimit that is set
     */
    function fetchCrossChainGasLimit() external view returns (uint256) {
        return _crossChainGasLimit;
    }

    /**
     * @notice setCrossChainGasPrice Used to set CrossChainGasPrice, this can only be set by CrossChain Admin or Admins
     * @param _gasPrice Amount of gasPrice that is to be set
     */
    function setCrossChainGasPrice(uint256 _gasPrice) public onlyOwner {
        _crossChainGasPrice = _gasPrice;
    }

    /**
     * @notice fetchCrossChainGasPrice Used to fetch CrossChainGasPrice
     * @return crossChainGasPrice that is set
     */
    function fetchCrossChainGasPrice() external view returns (uint256) {
        return _crossChainGasPrice;
    }

    function transferCrossChain(
        uint8 _chainID,
        address _recipient,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory _data
    ) public {
        _sendCrossChain(_chainID, _recipient, _ids, _amounts, _data);
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC1155)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }

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
