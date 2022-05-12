import { task, types } from "hardhat/config";
import { Contract } from "ethers";
import { TASK_UNMAP_CONTRACT } from "./task-names";

// chainid = Chain IDs defined by Router. Eg: Polygon, Fantom and BSC are assigned chain IDs 1, 2, 3.
// nchainid = Actual Chain IDs
task(TASK_UNMAP_CONTRACT, "Unmap Contracts")
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
      "0xd5808A8D0Ec8eae3929Bbc380e562649cDb957F0",
      "2",
      timeLimit.toString(),
    ]);
    const messageHashBytes = hre.ethers.utils.arrayify(digest);
    const Sign = await accounts[0].signMessage(messageHashBytes);
    await handlerContract.UnMapContract(
      [
        deployments[lchainID].greeter,
        taskArgs.chainid,
        deployments[taskArgs.nchainid].greeter,
        "2",
        timeLimit.toString(),
      ],
      Sign
    );
    console.log("Greeter Un-Mapping Done");
    return null;
  });
