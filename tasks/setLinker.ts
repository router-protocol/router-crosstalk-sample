/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-missing-import */

import { task, types } from "hardhat/config";
import { TASK_SET_LINKER } from "./task-names";

task(TASK_SET_LINKER, "Sets the linker address")
  .addParam(
    "contractAdd",
    "address of the cross-chain contract",
    "",
    types.string
  )
  .addParam("linkerAdd", "address of the linker", "", types.string)
  .setAction(async (taskArgs, hre): Promise<null> => {
    const contract = await hre.ethers.getContractFactory("Vault");
    const vault = await contract.attach(taskArgs.contractAdd);
    await vault.setLinker(taskArgs.linkerAdd, { gasLimit: 1000000 });
    console.log(`Linker address set`);
    return null;
  });
