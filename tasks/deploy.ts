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
  .addParam("handler", "address of handler", "", types.string)
  .addParam("linker", "address of linker", "", types.string)
  .addParam("feeToken", "address of fee token", "", types.string)
  .setAction(async (taskArgs, hre): Promise<null> => {
    const contract = await hre.ethers.getContractFactory("Greeter");
    const greeter = await contract.deploy(taskArgs.handler);
    await greeter.deployed();
    console.log(`Greeter deployed to: `, greeter.address);

    await hre.run(TASK_SET_LINKER, {
      contractAdd: greeter.address,
      linkerAdd: taskArgs.linker,
    });

    await hre.run(TASK_SET_FEES_TOKEN, {
      contractAdd: greeter.address,
      feeToken: taskArgs.feeToken,
    });

    await hre.run(TASK_APPROVE_FEES, {
      contractAdd: greeter.address,
      feeToken: taskArgs.feeToken,
    });

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "linker",
      contractAddress: taskArgs.linker,
    });

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "fee-token",
      contractAddress: taskArgs.feeToken,
    });

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "greeter",
      contractAddress: greeter.address,
    });

    await hre.run(TASK_STORE_DEPLOYMENTS, {
      contractName: "handler",
      contractAddress: taskArgs.handler,
    });

    return null;
  });
