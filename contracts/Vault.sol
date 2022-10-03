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

    constructor(
        address _token,
        address _sequencerHandler,
        address _erc20handler
    ) RouterSequencerCrossTalk(_sequencerHandler, _erc20handler) {
        token = IERC20(_token);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
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
        uint256 _amount,
        uint256 _crossChainGasLimit,
        uint256 _crossChainGasPrice,
        bytes memory _ercData,
        bytes calldata _swapData
    ) external returns (bytes32) {
        bytes4 _selector = bytes4(
            keccak256("receiveStakeCrossChain(address,uint256)")
        );
        bytes memory _data = abi.encode(msg.sender, _amount);
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
}
