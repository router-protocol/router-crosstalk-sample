/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-missing-import */

import { task } from "hardhat/config";
import { TASK_SET_STAKING_CONTRACT } from "./task-names";

task(
  TASK_SET_STAKING_CONTRACT,
  "Sets the staking contract address in vault"
).setAction(async (taskArgs, hre): Promise<null> => {
  const deployment = require("../deployments/sequencerDeployments.json");

  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;
  const staking = deployment[chainId].stake;
  const vaultContract = deployment[chainId].vault;
  const contract = await hre.ethers.getContractFactory("Vault");
  const vault = await contract.attach(vaultContract);
  await vault.setStakingContract(staking, { gasLimit: 1000000 });
  console.log(`Staking address set`);
  return null;
});
