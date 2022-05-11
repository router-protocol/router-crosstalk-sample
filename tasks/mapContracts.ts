import { Contract } from "ethers";
import { task, types } from "hardhat/config";
import { TASK_MAP_CONTRACT } from "./task-names";

// chainid = Destination Chain IDs defined by Router. Eg: Polygon, Fantom and BSC are assigned chain IDs 1, 2, 3.
// nchainid = Actual Destination Chain IDs
task(TASK_MAP_CONTRACT, "Map Contracts")
  .addParam<string>(
    "chainid",
    "Remote ChainID (Router Specs)",
    "",
    types.string
  )
  .addParam<string>("nchainid", "Remote ChainID", "", types.string)
  .setAction(async (taskArgs, hre): Promise<null> => {
    const deployments = require("../deployments/deployments.json");
    const handlerABI = require("../build/contracts/genericHandler.json");
    const network = await hre.ethers.provider.getNetwork();
    const lchainID = network.chainId.toString();
    const accounts = await hre.ethers.getSigners();
    const currentblockNo = await hre.ethers.provider.getBlockNumber();
    const currentBlock = await hre.ethers.provider.getBlock(currentblockNo);

    const timeLimit = Number(currentBlock.timestamp) + 500000;

    const handlerContract: Contract = await hre.ethers.getContractAt(
      handlerABI,
      deployments[lchainID].handler
    );

    const digest = await handlerContract.GenHash([
      deployments[lchainID].greeter,
      taskArgs.chainid,
      deployments[taskArgs.nchainid].greeter,
      "1",
      timeLimit.toString(),
    ]);
    const messageHashBytes = hre.ethers.utils.arrayify(digest);
    const Sign = await accounts[0].signMessage(messageHashBytes);
    await handlerContract.MapContract(
      [
        deployments[lchainID].greeter,
        taskArgs.chainid,
        deployments[taskArgs.nchainid].greeter,
        "1",
        timeLimit.toString(),
      ],
      Sign
    );
    console.log("Greeter Mapping Done");
    return null;
  });
