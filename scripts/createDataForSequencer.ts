/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
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
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider); // provider was set up while initializing an instance of RouterProtocol

  const routerprotocol = new RouterProtocol(
    SDK_ID.toString(),
    chainId.toString(),
    provider
  );
  await routerprotocol.initialize();

  // get sequencer data for USDC transfer from Polygon to Fantom
  let args = {
    amount: ethers.utils.parseUnits("10.0", 6).toString(), // 10 USDC
    dest_chain_id: "250", // Fantom
    src_token_address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
    dest_token_address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC on Fantom
    recipient_address: wallet.address,
    fee_token_address: "0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4", // ROUTE on Polygon
    slippage_tolerance: 2.0,
    generic_data: "0x00", // abi.encode(selector, values)
    gas_limit: "1000000", // developer will set
    gas_price: "1000000000", // developer will fetch or set
    is_transfer_first: true, // if true, sequence will be erc20 and then generic call
    is_only_generic: false, // if only generic tx will happen
    is_dest_native: false, // destination token is native token or not
  };

  const sequencerData = await routerprotocol.getSequencerParams(
    args.amount,
    args.dest_chain_id,
    args.src_token_address,
    args.dest_token_address,
    args.recipient_address,
    args.fee_token_address,
    args.slippage_tolerance,
    args.generic_data,
    args.gas_limit,
    args.gas_price,
    args.is_transfer_first,
    args.is_only_generic,
    args.is_dest_native
  );
  console.log("sequencer params => ", sequencerData);

  // Output
  //   {
  //     _destChainID: '4',
  //     _erc20: '0x000000000000000000000000000000000000000000000000000000000000000400000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000012000000000000000000000000016eccfdbb4ee1a85a33f3a9b21175cd7ae753db40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  //     _swapData: '0x000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000989680000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018B00BC9e04698A3315B6038225a2E9e42D63C76692791Bca1f2de4661ED88A30C99A7a9449Aa8417404068DA6C83AFCFA0e13ba15A6696662335D5B7504068DA6C83AFCFA0e13ba15A6696662335D5B75',
  //     _generic: '0x00',
  //     _gasLimit: '1000000',
  //     _gasPrice: '1000000000',
  //     _feeToken: '0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4',
  //     _isTransferFirst: true,
  //     _isOnlyGeneric: false
  //   }
};

main();
