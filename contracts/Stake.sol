//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IStake.sol";

contract Stake is IStake {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    address public immutable vault;
    IERC20 public immutable token;

    // user address  => staked amount
    mapping(address => uint256) public stakedBalance;

    constructor(address _vault, address _token) {
        vault = _vault;
        token = IERC20(_token);
    }

    modifier onlyVault() {
        require(msg.sender == vault, "Only Vault");
        _;
    }

    function stake(address user, uint256 amount) external override onlyVault {
        uint256 balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 balanceAfter = token.balanceOf(address(this));
        uint256 _amount = balanceAfter.sub(balanceBefore, "No amount received");
        stakedBalance[user] += _amount;
    }

    function unstake(address user, uint256 amount) external override onlyVault {
        stakedBalance[user] = stakedBalance[user].sub(
            amount,
            "User balance too low"
        );
        token.safeTransfer(user, amount);
    }
}
