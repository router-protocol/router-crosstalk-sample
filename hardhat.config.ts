/* eslint-disable prettier/prettier */
import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/deploy";
import "./tasks/setLinker";
import "./tasks/setFeeToken";
import "./tasks/storeDeployments";
import "./tasks/mapContracts";
import "./tasks/unMapContracts";
import "./tasks/approveFees";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const mnemonic = process.env.MNEMONIC || "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.8.4",
      },
    ],
    settings: {
      evmVersion: "berlin",
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        bytecodeHash: "none",
      },
      // You should disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  //  defaultNetwork: "kovan",
  networks: {
    polygon: {
      url: process.env.MATIC_RPC || "",
      accounts: [mnemonic],
    },
    bsc: {
      url: process.env.BSC_RPC || "",
      accounts: [mnemonic],
    },
    ftm: {
      url: process.env.FTM_RPC || "",
      accounts: [mnemonic],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGON_ETHERSCAN_KEY,
      polygonMumbai: process.env.POLYGON_KEY,
      bsc: process.env.BSC_KEY,
      opera: process.env.FTMSCAN_KEY,
    },
  },
};

export default config;
