/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-missing-import */
import { task } from "hardhat/config";
import {
  TASK_VERIFY_ALL,
  TASK_VERIFY_STAKE,
  TASK_VERIFY_VAULT,
} from "./task-names";

task(TASK_VERIFY_ALL, "Verifies vault and stake contracts").setAction(
  async (taskArgs, hre) => {
    await hre.run(TASK_VERIFY_VAULT);
    await hre.run(TASK_VERIFY_STAKE);
  }
);

task(TASK_VERIFY_VAULT, "Verifies the vault contract").setAction(
  async (taskArgs, hre) => {
    const deployments = require("../deployments/sequencerDeployments.json");
    const network = await hre.ethers.provider.getNetwork();
    const chainId = network.chainId;

    const vaultAddress = deployments[chainId].vault;
    const token = deployments[chainId].token;
    const sequencerHandler = deployments[chainId].sequencerHandler;
    const erc20Handler = deployments[chainId].erc20Handler;
    const reserveHandler = deployments[chainId].reserveHandler;

    console.log("Vault verification started");
    await hre.run("verify:verify", {
      address: vaultAddress,
      constructorArguments: [
        token,
        sequencerHandler,
        erc20Handler,
        reserveHandler,
      ],
    });
    console.log("Vault verification ended");
  }
);

task(TASK_VERIFY_STAKE, "Verifies the stake contract").setAction(
  async (taskArgs, hre) => {
    const deployments = require("../deployments/sequencerDeployments.json");
    const network = await hre.ethers.provider.getNetwork();
    const chainId = network.chainId;

    const stakeAddress = deployments[chainId].stake;
    const vaultAddress = deployments[chainId].vault;
    const token = deployments[chainId].token;

    console.log("Stake verification started");
    await hre.run("verify:verify", {
      address: stakeAddress,
      constructorArguments: [vaultAddress, token],
    });
    console.log("Stake verification ended");
  }
);
