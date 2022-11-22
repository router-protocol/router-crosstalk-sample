//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@routerprotocol/router-crosstalk/contracts/RouterSequencerCrossTalk.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IStake.sol";

contract Vault is RouterSequencerCrossTalk, AccessControl {
    using SafeERC20 for IERC20;
    IStake public stakingContract;
    IERC20 public immutable token;
    uint256 public nonce;
    mapping(uint256 => bytes32) public nonceToHash;

    constructor(
        address _token,
        address _sequencerHandler,
        address _erc20handler,
        address _reservehandler
    )
        RouterSequencerCrossTalk(
            _sequencerHandler,
            _erc20handler,
            _reservehandler
        )
    {
        token = IERC20(_token);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setLinker(address _linker) external onlyRole(DEFAULT_ADMIN_ROLE) {
        setLink(_linker);
    }

    function setFeesToken(address _feeToken)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        setFeeToken(_feeToken);
    }

    function _approveFees(address _feeToken, uint256 _amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        approveFees(_feeToken, _amount);
    }

    function _approveTokens(
        address _toBeApproved,
        address _token,
        uint256 _value
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        approveTokens(_toBeApproved, _token, _value);
    }

    function setStakingContract(address _stakingContract)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        stakingContract = IStake(_stakingContract);
    }

    function stake(uint256 _amount) external {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        stakingContract.stake(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external {
        stakingContract.unstake(msg.sender, _amount);
    }

    function stakeCrossChain(
        uint8 _chainID,
        uint256 _crossChainGasLimit,
        uint256 _crossChainGasPrice,
        bytes memory _ercData,
        bytes calldata _swapData
    ) external returns (bytes32) {
        nonce = nonce + 1;
        bytes4 _selector = bytes4(
            keccak256("receiveStakeCrossChain(address,uint256)")
        );
        uint256 amount = abi.decode(_swapData, (uint256));
        bytes memory _data = abi.encode(msg.sender, amount);
        bytes memory _genericData = abi.encode(_selector, _data);
        Params memory params = Params(
            _chainID,
            _ercData,
            _swapData,
            _genericData,
            _crossChainGasLimit,
            _crossChainGasPrice,
            this.fetchFeeToken(),
            true,
            false
        );
        (bool success, bytes32 hash) = routerSend(params);
        nonceToHash[nonce] = hash;
        require(success, "Unsuccessful");
        return hash;
    }

    function receiveStakeCrossChain(address _user, uint256 _amount)
        external
        isSelf
    {
        stakingContract.stake(_user, _amount);
    }

    function _routerSyncHandler(bytes4 _selector, bytes memory _data)
        internal
        override
        returns (bool, bytes memory)
    {
        if (
            _selector ==
            bytes4(keccak256("receiveStakeCrossChain(address,uint256)"))
        ) {
            (address user, uint256 amount) = abi.decode(
                _data,
                (address, uint256)
            );
            (bool success, bytes memory data) = address(this).call(
                abi.encodeWithSelector(_selector, user, amount)
            );
            return (success, data);
        }

        return (true, "");
    }

    function replayTx(
        uint64 _nonce,
        uint256 crossChainGasLimit,
        uint256 crossChainGasPrice
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        routerReplay(
            nonceToHash[_nonce],
            crossChainGasLimit,
            crossChainGasPrice
        );
    }

    function recoverFeeTokens(address owner)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        address feeToken = this.fetchFeeToken();
        uint256 amount = IERC20(feeToken).balanceOf(address(this));
        IERC20(feeToken).transfer(owner, amount);
    }
}
