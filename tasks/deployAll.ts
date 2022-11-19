/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-missing-import */
import { task } from "hardhat/config";
import {
  TASK_DEPLOY_VAULT,
  TASK_DEPLOY_STAKE,
  TASK_SET_STAKING_CONTRACT,
  TASK_DEPLOY_ALL,
  TASK_APPROVE_TOKENS,
} from "./task-names";

task(TASK_DEPLOY_ALL, "deploys the project").setAction(
  async (taskArgs, hre): Promise<null> => {
    console.log("Deploying Vault started");
    await hre.run(TASK_DEPLOY_VAULT);
    console.log("Deploying Vault ended");

    console.log("Deploying Stake started");
    await hre.run(TASK_DEPLOY_STAKE);
    console.log("Deploying Stake ended");

    console.log("Setting Stake contract started");
    await hre.run(TASK_SET_STAKING_CONTRACT);
    console.log("Setting Stake contract ended");

    console.log("Approving Stake contract started");
    await hre.run(TASK_APPROVE_TOKENS);
    console.log("Approving Stake contract ended");

    return null;
  }
);
