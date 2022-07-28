/* eslint-disable prettier/prettier */
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
    const contract = await hre.ethers.getContractFactory("CERC1155");
    const CERC1155 = await contract.attach(taskArgs.contractAdd);
    await CERC1155.setLinker(taskArgs.linkerAdd, { gasLimit: 100000 });
    console.log(`Linker address set`);
    return null;
  });
