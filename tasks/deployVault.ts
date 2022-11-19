/* eslint-disable prettier/prettier */
/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
import { task } from "hardhat/config";
import {
  TASK_APPROVE_FEES,
  TASK_DEPLOY_VAULT,
  TASK_SET_FEES_TOKEN,
  TASK_SET_LINKER,
  TASK_STORE_DEPLOYMENTS,
} from "./task-names";

task(TASK_DEPLOY_VAULT, "Deploys the vault contract").setAction(
  async (taskArgs, hre): Promise<null> => {
    const deployment = require("../deployments/sequencerDeployments.json");

    const network = await hre.ethers.provider.getNetwork();
    const chainId = network.chainId;

    const sequencerHandler = deployment[chainId].sequencerHandler;
    const erc20Handler = deployment[chainId].erc20Handler;
    const reserveHandler = deployment[chainId].reserveHandler;
    const feeToken = deployment[chainId].feeToken;
    const linker = deployment[chainId].linker;
    const token = deployment[chainId].token;

    const contract = await hre.ethers.getContractFactory("Vault");

    const vault = await contract.deploy(
      token,
      sequencerHandler,
      erc20Handler,
      reserveHandler
    );
    await vault.deployed();
    console.log(`vault deployed to: `, vault.address);

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "vault",
      contractAddress: vault.address,
    });

    await hre.run(TASK_SET_LINKER, {
      contractAdd: vault.address,
      linkerAdd: linker,
    });

    await hre.run(TASK_SET_FEES_TOKEN, {
      contractAdd: vault.address,
      feeToken: feeToken,
    });

    await hre.run(TASK_APPROVE_FEES, {
      contractAdd: vault.address,
      feeToken: feeToken,
    });

    return null;
  }
);
