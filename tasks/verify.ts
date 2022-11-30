/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("verify:CERC1155").setAction(async function (
  _taskArguments: TaskArguments,
  hre
) {
  const deployments = require("../deployments/deployments.json");

  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;
  console.log("NFT verification started");
  const handler = deployments[chainId].handler;
  const uri = deployments[chainId].uri;
  const cerc1155 = deployments[chainId].CERC1155;

  await hre.run("verify:verify", {
    address: cerc1155,
    constructorArguments: [uri, handler],
  });
  console.log("NFT verification ended");
});
