/* eslint-disable prettier/prettier */
import axios from "axios";

// get a quote for USDC transfer from Avalanche to Kava
const baseUrl =
  "https://api.pathfinder.routerprotocol.com/api/quote/sequencer?";

const args = {
  fromTokenAddress: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // USDC on Avalanche
  toTokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
  amount: "10000", // 0.01 USDC as USDC is 6 decimals
  sourceChainId: "43114", // Avalanche
  destChainId: "137", // Polygon
  feeTokenAddress: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // USDC on Avalanche
  recipientAddress: "0x941982814Eb5307e97133beCb118951a109717e3", // Receiver on Polygon -> Vault contract address
  isDestNative: "false",
};

const url =
  baseUrl +
  "fromTokenAddress=" +
  args.fromTokenAddress +
  "&toTokenAddress=" +
  args.toTokenAddress +
  "&amount=" +
  args.amount +
  "&fromTokenChainId=" +
  args.sourceChainId +
  "&toTokenChainId=" +
  args.destChainId +
  "&feeTokenAddress=" +
  args.feeTokenAddress +
  "&isDestNative=" +
  args.isDestNative +
  "&recipientAddress=" +
  args.recipientAddress;

async function main() {
  const { data } = await axios.get(url);
  console.log(data);
}

main();
