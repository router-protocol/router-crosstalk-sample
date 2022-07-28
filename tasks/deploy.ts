/* eslint-disable prettier/prettier */
import { task } from "hardhat/config";
import {
  TASK_APPROVE_FEES,
  TASK_DEPLOY,
  TASK_SET_CROSSCHAIN_GAS,
  TASK_SET_FEES_TOKEN,
  TASK_SET_LINKER,
  TASK_STORE_DEPLOYMENTS,
} from "./task-names";
const deployment = require("../deployments/deployments.json");

task(TASK_DEPLOY, "Deploys the project").setAction(
  async (taskArgs, hre): Promise<null> => {
    const network = await hre.ethers.provider.getNetwork();
    const chainId = network.chainId;

    const handler = deployment[chainId].handler;
    const uri = deployment[chainId].uri;
    const linker = deployment[chainId].linker;
    const feeToken = deployment[chainId].feeToken;
    const crossChainGas = deployment[chainId].crossChainGas;

    const contract = await hre.ethers.getContractFactory("CERC1155");
    const CERC1155 = await contract.deploy(uri, handler);
    await CERC1155.deployed();
    console.log(`CERC1155 deployed to: `, CERC1155.address);

    await hre.run(TASK_SET_LINKER, {
      contractAdd: CERC1155.address,
      linkerAdd: linker,
    });

    await hre.run(TASK_SET_FEES_TOKEN, {
      contractAdd: CERC1155.address,
      feeToken: feeToken,
    });

    await hre.run(TASK_APPROVE_FEES, {
      contractAdd: CERC1155.address,
      feeToken: feeToken,
    });

    await hre.run(TASK_SET_CROSSCHAIN_GAS, {
      contractAdd: CERC1155.address,
      gasLimit: crossChainGas,
    });

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "CERC1155",
      contractAddress: CERC1155.address,
    });

    return null;
  }
);
