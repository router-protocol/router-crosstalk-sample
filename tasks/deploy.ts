/* eslint-disable prettier/prettier */
import { task, types } from "hardhat/config";
import { type } from "os";
import {
  TASK_APPROVE_FEES,
  TASK_DEPLOY,
  TASK_SET_FEES_TOKEN,
  TASK_SET_LINKER,
  TASK_STORE_DEPLOYMENTS,
} from "./task-names";

task(TASK_DEPLOY, "Deploys the project")
  .addParam("uri", "uri of erc1155", "", types.string)
  .addParam("handler", "address of handler", "", types.string)
  .addParam("linker", "address of linker", "", types.string)
  .addParam("feeToken", "address of fee token", "", types.string)
  .setAction(async (taskArgs, hre): Promise<null> => {
    const contract = await hre.ethers.getContractFactory("CERC1155");
    const CERC1155 = await contract.deploy(taskArgs.uri, taskArgs.handler);
    await CERC1155.deployed();
    console.log(`CERC1155 deployed to: `, CERC1155.address);

    await hre.run(TASK_SET_LINKER, {
      contractAdd: CERC1155.address,
      linkerAdd: taskArgs.linker,
    });

    await hre.run(TASK_SET_FEES_TOKEN, {
      contractAdd: CERC1155.address,
      feeToken: taskArgs.feeToken,
    });

    // await hre.run(TASK_APPROVE_FEES, {
    //   contractAdd: CERC1155.address,
    //   feeToken: taskArgs.feeToken,
    // });

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "linker",
      contractAddress: taskArgs.linker,
    });

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "fee-token",
      contractAddress: taskArgs.feeToken,
    });

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "CERC1155",
      contractAddress: CERC1155.address,
    });

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "handler",
      contractAddress: taskArgs.handler,
    });

    return null;
  });
