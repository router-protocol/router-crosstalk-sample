/* eslint-disable prettier/prettier */
/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
import { task } from "hardhat/config";
import { TASK_DEPLOY_STAKE, TASK_STORE_DEPLOYMENTS } from "./task-names";

task(TASK_DEPLOY_STAKE, "Deploys the staking contract").setAction(
  async (taskArgs, hre): Promise<null> => {
    const deployment = require("../deployments/sequencerDeployments.json");

    const network = await hre.ethers.provider.getNetwork();
    const chainId = network.chainId;
    const vault = deployment[chainId].vault;
    const token = deployment[chainId].token;

    const contract = await hre.ethers.getContractFactory("Stake");

    const stake = await contract.deploy(vault, token);
    await stake.deployed();
    console.log(`stake deployed to: `, stake.address);

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "stake",
      contractAddress: stake.address,
    });
    return null;
  }
);
