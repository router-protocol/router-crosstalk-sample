/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
/* eslint-disable node/no-extraneous-import */

import { RouterProtocol } from "@routerprotocol/router-js-sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const main = async () => {
  // initialize a RouterProtocol instance
  let SDK_ID = 24; // get your unique sdk id by contacting us on Telegram
  let chainId = 137;
  const provider = new ethers.providers.JsonRpcProvider(
    "https://polygon-rpc.com",
    chainId
  );

  const routerprotocol = new RouterProtocol(
    SDK_ID.toString(),
    chainId.toString(),
    provider
  );

  await routerprotocol.initialize();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider); // provider was set up while initializing an instance of RouterProtocol

  // get a quote for USDC transfer from Polygon to Fantom
  let args = {
    amount: ethers.utils.parseUnits("0.01", 6).toString(), // 10 USDC
    dest_chain_id: "250", // Fantom
    src_token_address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
    dest_token_address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC on Fantom
    user_address: wallet.address,
    fee_token_address: "0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4", // ROUTE on Polygon
    slippage_tolerance: 2.0,
    genericData: "0x00", // Dummmy data
    gasLimit: "1000000",
    gasPrice: ethers.utils.parseUnits("1.0", 10).toString(),
    isTransferFirst: true,
    isOnlyGeneric: false,
    isDestNative: false,
  };

  const sequencerParams = await routerprotocol.getSequencerParams(
    args.amount,
    args.dest_chain_id,
    args.src_token_address,
    args.dest_token_address,
    args.user_address,
    args.fee_token_address,
    args.slippage_tolerance,
    args.genericData,
    args.gasLimit,
    args.gasPrice,
    args.isTransferFirst,
    args.isOnlyGeneric,
    args.isDestNative
  );

  console.log(sequencerParams);
};

main();
