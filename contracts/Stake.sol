//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IStake.sol";

contract Stake is IStake {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    address public immutable vault;

    // user address => token address => staked amount
    mapping(address => mapping(address => uint256)) public stakedBalance;

    constructor(address _vault) {
        vault = _vault;
    }

    modifier onlyVault() {
        require(msg.sender == vault, "Only Vault");
        _;
    }

    function stake(
        address user,
        address token,
        uint256 amount
    ) external override onlyVault {
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        uint256 _amount = balanceAfter.sub(balanceBefore, "No amount received");
        stakedBalance[user][token] += _amount;
    }

    function unstake(
        address user,
        address token,
        uint256 amount
    ) external override onlyVault {
        stakedBalance[user][token] = stakedBalance[user][token].sub(
            amount,
            "User balance too low"
        );
        IERC20(token).safeTransfer(user, amount);
    }
}
