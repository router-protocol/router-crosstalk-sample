/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-missing-import */
import { TASK_APPROVE_TOKENS } from "./task-names";
import { task } from "hardhat/config";

task(TASK_APPROVE_TOKENS, "Vault approves staaking contract").setAction(
  async (taskArgs, hre): Promise<null> => {
    const deployment = require("../deployments/sequencerDeployments.json");

    const network = await hre.ethers.provider.getNetwork();
    const chainId = network.chainId;
    const vaultAddress = deployment[chainId].vault;
    const token = deployment[chainId].token;
    const stake = deployment[chainId].stake;

    const contract = await hre.ethers.getContractFactory("Vault");
    const vault = await contract.attach(vaultAddress);
    await vault._approveTokens(stake, token, "10000000", {
      gasLimit: 2000000,
    });
    console.log(`Tokens approved`);
    return null;
  }
);
