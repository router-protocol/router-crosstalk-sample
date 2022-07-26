// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC1155/CrossChainERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyCrossChainERC1155 is CrossChainERC1155 {
    address public owner;

    constructor(string memory uri_, address genericHandler_)
        CrossChainERC1155(uri_, genericHandler_)
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

    /* ADMINISTRATIVE FUNCTIONS */

    function setLinker(address _linker) public onlyOwner {
        setLink(_linker);
    }

    function setFeeAddress(address _feeAddress) public onlyOwner {
        setFeeToken(_feeAddress);
    }

    function _approveFees(address _feeToken, uint256 amount) public onlyOwner {
        approveFees(_feeToken, amount);
    }

    function setCrossChainGasLimit(uint256 _gasLimit) public onlyOwner {
        _setCrossChainGasLimit(_gasLimit);
    }

    function setCrossChainGasPrice(uint256 _gasPrice) public onlyOwner {
        _setCrossChainGasPrice(_gasPrice);
    }

    /* ADMINISTRATIVE FUNCTIONS END */

    function transferCrossChain(
        uint8 _chainID,
        address _recipient,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory _data
    ) external {
        _sendCrossChain(_chainID, _recipient, _ids, _amounts, _data);
    }

    function recoverFeeTokens() external onlyOwner {
        address feeToken = this.fetchFeetToken();
        uint256 amount = IERC20(feeToken).balanceOf(address(this));
        IERC20(feeToken).transfer(owner, amount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(CrossChainERC1155)
        returns (bool)
    {
        return
            interfaceId == type(ICrossChainERC1155).interfaceId ||
            interfaceId == type(ICrossChainERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
