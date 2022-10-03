//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IStake {
    function stake(address user, uint256 amount) external;

    function unstake(address user, uint256 amount) external;
}
